// Continuous Deepgram voice session — ES class port of caremagix-fe/js/voice_mode.js,
// kept close to the original (proven audio-pipeline/reconnect behavior) so it stays a
// straight reference against the legacy implementation. Framework-agnostic: React
// wires it up via useDeepgramVoice.js.
const LISTEN_URL = "wss://api.deepgram.com/v1/listen";
const TARGET_SAMPLE_RATE = 16000;
const KEEPALIVE_MS = 5000;
const PROCESSOR_BUFFER = 4096;
const UTTERANCE_SILENCE_MS = 1800;

function floatTo16BitPcm(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function downsampleBuffer(buffer, inputRate, outputRate) {
  if (inputRate === outputRate) return floatTo16BitPcm(buffer);
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    const mean = count ? accum / count : 0;
    result[offsetResult] = Math.max(-32768, Math.min(32767, mean * 32767));
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function joinTranscript(parts, interim) {
  return (parts || [])
    .concat(interim ? [interim] : [])
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export default class DeepgramVoiceSession {
  constructor(options = {}) {
    this.options = options;
    this.continuous = !!options.continuous;
    this.active = false;
    this.paused = false;
    this.state = "idle"; // idle | connecting | listening | paused | thinking | speaking
    this.socket = null;
    this.audioContext = null;
    this.processor = null;
    this.source = null;
    this.gain = null;
    this.stream = null;
    this.keepAliveTimer = null;
    this.utteranceTimer = null;
    this.finalPieces = [];
    this.interimText = "";
    this.ignoreTranscripts = false;
    this.flushing = false;
    this.audioEl = null;
    this.reconnectAttempts = 0;
    this.speakToken = 0;
    this.pcmPlayback = null;
    this._speakDone = null;
  }

  _setState(state) {
    this.state = state;
    this.options.onStateChange?.(state);
  }

  _emitTranscript(text) {
    this.options.onTranscript?.(text);
  }

  _error(message) {
    this.options.onError?.(message);
  }

  isActive() {
    return this.active;
  }

  toggle() {
    return this.active ? (this.stop(), Promise.resolve()) : this.start();
  }

  async start() {
    if (this.active) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      this._error("This browser cannot use the microphone. Please type instead.");
      throw new Error("microphone unsupported");
    }

    this.active = true;
    this.reconnectAttempts = 0;
    this._setState("connecting");

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: !this.continuous, autoGainControl: true, channelCount: 1 },
      });
      if (!this.active) {
        this.stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const tokenInfo = await this.options.fetchToken();
      if (!this.active) return;
      await this._openSocket(tokenInfo);
    } catch (err) {
      this.stop();
      const msg = err?.name === "NotAllowedError" ? "Microphone permission denied" : err?.message || "Could not start voice mode";
      this._error(msg);
      throw err;
    }
  }

  stop() {
    this.active = false;
    this.paused = false;
    this.ignoreTranscripts = false;
    this.flushing = false;
    this.finalPieces = [];
    this.interimText = "";
    this.stopPlayback();
    this._clearUtteranceTimer();
    this._teardownAudio();
    this._closeSocket();
    this._setState("idle");
    this._emitTranscript("");
  }

  _setMicMuted(muted) {
    this.stream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  // Called before sending a turn to the backend — mutes the mic and marks the
  // socket as "thinking" so nothing captured while the agent is replying is
  // treated as the next utterance.
  pauseForTurn() {
    this.ignoreTranscripts = true;
    this._setMicMuted(true);
    this._sendKeepAlive();
    if (this.state !== "speaking") this._setState("thinking");
  }

  // Called once a reply (and its optional spoken playback) has finished.
  resumeAfterTurn() {
    if (!this.active) return;
    this.finalPieces = [];
    this.interimText = "";
    this.flushing = false;
    this.ignoreTranscripts = false;
    this._setMicMuted(false);
    this._setState("listening");
    this._emitTranscript("");
  }

  isPaused() {
    return !!(this.active && this.paused);
  }

  // Manual pause for a feature-initiated "Pause" control (distinct from
  // pauseForTurn's automatic mute while an agent replies) — drains whatever
  // was mid-utterance first so tapping Pause never silently drops a
  // half-finished sentence.
  pauseListening() {
    if (!this.active || this.paused) return "";
    const leftover = this.drainPendingTranscript();
    this.paused = true;
    this.ignoreTranscripts = true;
    this._setMicMuted(true);
    this._sendKeepAlive();
    this._setState("paused");
    return leftover;
  }

  resumeListening() {
    if (!this.active || !this.paused) return Promise.resolve();
    this.paused = false;
    this.ignoreTranscripts = false;
    this.flushing = false;
    this.finalPieces = [];
    this.interimText = "";
    this._setMicMuted(false);
    this._emitTranscript("");

    if (this.socket?.readyState === WebSocket.OPEN) {
      this._setState("listening");
      return Promise.resolve();
    }

    // The socket may have closed itself while paused (onclose short-circuits
    // reconnect when this.paused is true) — reopen with a fresh token.
    this._setState("connecting");
    return this.options.fetchToken().then((tokenInfo) => {
      if (!this.active || this.paused) return;
      return this._openSocket(tokenInfo);
    });
  }

  // Returns and clears whatever text has been recognized but not yet flushed
  // as a finished utterance — used by pauseListening (above) and by a caller
  // that wants the last few words before stopping outright.
  drainPendingTranscript() {
    const text = joinTranscript(this.finalPieces, this.interimText);
    this.finalPieces = [];
    this.interimText = "";
    this._clearUtteranceTimer();
    return text;
  }

  playBase64Audio(b64, contentType) {
    const token = ++this.speakToken;
    return new Promise((resolve) => {
      if (!b64) {
        resolve();
        return;
      }
      this.stopPlayback();
      if (this.active) {
        this._setMicMuted(true);
        this._setState("speaking");
      }
      const audio = new Audio(`data:${contentType || "audio/mpeg"};base64,${b64}`);
      this.audioEl = audio;
      this._speakDone = resolve;
      const done = () => {
        if (this.audioEl === audio) this.audioEl = null;
        if (this._speakDone === resolve) this._speakDone = null;
        if (token === this.speakToken) resolve();
      };
      audio.onended = done;
      audio.onerror = done;
      audio.play()?.catch(done);
    });
  }

  // Chunked PCM playback for the streaming /voice/speak response — starts
  // speaking as audio arrives instead of waiting for the whole clip like
  // playBase64Audio. `response` is a fetch() Response with a readable body.
  playPcmStream(response) {
    const token = ++this.speakToken;
    if (!response?.body || typeof response.body.getReader !== "function") {
      return Promise.reject(new Error("streaming not supported"));
    }
    const sampleRate = parseInt(response.headers.get("X-Audio-Sample-Rate") || "24000", 10) || 24000;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return Promise.reject(new Error("Web Audio is not available"));

    this.stopPlayback();
    if (this.active) {
      this._setMicMuted(true);
      this._setState("speaking");
    }

    const ctx = new AudioCtx();
    const playback = { ctx, sources: [] };
    this.pcmPlayback = playback;

    return new Promise((resolve) => {
      this._speakDone = resolve;
      const finish = () => {
        if (this.pcmPlayback === playback) this.pcmPlayback = null;
        if (this._speakDone === resolve) this._speakDone = null;
        if (token === this.speakToken) resolve();
      };

      Promise.resolve(ctx.state === "suspended" ? ctx.resume() : null)
        .then(() => {
          const reader = response.body.getReader();
          let leftover = new Uint8Array(0);
          let nextTime = ctx.currentTime + 0.04;

          const schedulePcm = (u8) => {
            const even = u8.length - (u8.length % 2);
            if (even < 2) return u8;
            const samples = new Int16Array(u8.buffer.slice(u8.byteOffset, u8.byteOffset + even));
            const f32 = new Float32Array(samples.length);
            for (let i = 0; i < samples.length; i++) f32[i] = samples[i] / 32768;
            const buffer = ctx.createBuffer(1, f32.length, sampleRate);
            buffer.getChannelData(0).set(f32);
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            src.connect(ctx.destination);
            const startAt = Math.max(nextTime, ctx.currentTime);
            src.start(startAt);
            nextTime = startAt + buffer.duration;
            playback.sources.push(src);
            return u8.subarray(even);
          };

          const readChunk = () => {
            if (token !== this.speakToken || this.pcmPlayback !== playback) {
              try {
                reader.cancel();
              } catch {
                /* already done */
              }
              return Promise.resolve();
            }
            return reader.read().then((result) => {
              if (token !== this.speakToken || this.pcmPlayback !== playback) return;
              if (result.done) {
                if (leftover.length) schedulePcm(leftover);
                const remainingMs = Math.max(0, (nextTime - ctx.currentTime) * 1000);
                return new Promise((r) => setTimeout(r, remainingMs + 40));
              }
              const chunk = result.value || new Uint8Array(0);
              const combined = new Uint8Array(leftover.length + chunk.length);
              combined.set(leftover, 0);
              combined.set(chunk, leftover.length);
              leftover = schedulePcm(combined);
              return readChunk();
            });
          };

          return readChunk();
        })
        .then(finish)
        .catch(finish);
    });
  }

  _stopPcmPlayback() {
    if (!this.pcmPlayback) return;
    const playback = this.pcmPlayback;
    this.pcmPlayback = null;
    playback.sources.forEach((src) => {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    });
    try {
      playback.ctx.close();
    } catch {
      /* already closed */
    }
  }

  stopPlayback() {
    this._stopPcmPlayback();
    if (this.audioEl) {
      try {
        this.audioEl.pause();
      } catch {
        /* already stopped */
      }
      this.audioEl = null;
    }
    if (this._speakDone) {
      const done = this._speakDone;
      this._speakDone = null;
      done();
    }
  }

  // Cuts off whatever's currently playing (stream or base64) and hands the
  // mic straight back — the "Talk now" interrupt.
  interruptSpeech() {
    this.speakToken += 1;
    this.stopPlayback();
    if (this.active) this.resumeAfterTurn();
  }

  _listenUrl(tokenInfo) {
    const params = new URLSearchParams({
      model: tokenInfo?.model || "nova-2",
      punctuate: "true",
      smart_format: "true",
      interim_results: "true",
      utterance_end_ms: this.continuous ? "2000" : "1500",
      vad_events: "true",
      endpointing: this.continuous ? "500" : "400",
      language: "en",
      encoding: "linear16",
      sample_rate: String(TARGET_SAMPLE_RATE),
      channels: "1",
    });
    return `${LISTEN_URL}?${params.toString()}`;
  }

  _openSocket(tokenInfo, authStyle = "protocol") {
    return new Promise((resolve, reject) => {
      const url = this._listenUrl(tokenInfo);
      const token = tokenInfo.access_token;
      let socket;
      let handshakeDone = false;
      try {
        socket =
          authStyle === "protocol"
            ? new WebSocket(url, ["bearer", token])
            : new WebSocket(`${url}&authorization=${encodeURIComponent(`Bearer ${token}`)}`);
      } catch (err) {
        if (authStyle === "protocol") {
          this._openSocket(tokenInfo, "query").then(resolve, reject);
          return;
        }
        reject(err);
        return;
      }

      this.socket = socket;
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        handshakeDone = true;
        this.reconnectAttempts = 0;
        this._startKeepAlive();
        try {
          this._startPcmCapture();
        } catch (err) {
          reject(err);
          return;
        }
        this._setState("listening");
        resolve();
      };

      socket.onmessage = (event) => this._handleSocketMessage(event.data);
      socket.onerror = () => {
        /* onclose handles cleanup/reconnect */
      };

      socket.onclose = () => {
        this._clearKeepAlive();
        if (!handshakeDone) {
          if (authStyle === "protocol" && this.active) {
            this._openSocket(tokenInfo, "query").then(resolve, reject);
            return;
          }
          reject(new Error("Could not connect to live transcription"));
          return;
        }
        if (!this.active || this.paused) {
          this.socket = null;
          return;
        }
        if (this.reconnectAttempts >= 2) {
          this.stop();
          this._error("Voice connection lost. Tap the microphone to try again.");
          return;
        }
        this.reconnectAttempts += 1;
        this._setState("connecting");
        this.options
          .fetchToken()
          .then((nextToken) => {
            if (!this.active || this.paused) return;
            return this._openSocket(nextToken);
          })
          .catch((err) => {
            if (!this.active) return;
            this.stop();
            this._error(err?.message || "Voice connection lost");
          });
      };
    });
  }

  _closeSocket() {
    this._clearKeepAlive();
    const socket = this.socket;
    this.socket = null;
    if (!socket) return;
    try {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "CloseStream" }));
      socket.close();
    } catch {
      /* already closed */
    }
  }

  _sendKeepAlive() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type: "KeepAlive" }));
      } catch {
        /* ignore */
      }
    }
  }

  _startKeepAlive() {
    this._clearKeepAlive();
    this._sendKeepAlive();
    this.keepAliveTimer = setInterval(() => this._sendKeepAlive(), KEEPALIVE_MS);
  }

  _clearKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  _startPcmCapture() {
    this._teardownCapture();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioCtx();
    if (this.audioContext.state === "suspended") this.audioContext.resume();

    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(PROCESSOR_BUFFER, 1, 1);
    this.gain = this.audioContext.createGain();
    this.gain.gain.value = 0;

    this.processor.onaudioprocess = (event) => {
      if (!this.active || this.socket?.readyState !== WebSocket.OPEN || this.ignoreTranscripts) return;
      const input = event.inputBuffer.getChannelData(0);
      const pcm = downsampleBuffer(input, this.audioContext.sampleRate, TARGET_SAMPLE_RATE);
      if (pcm?.length) this.socket.send(pcm.buffer.slice(0));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.gain);
    this.gain.connect(this.audioContext.destination);
  }

  _teardownCapture() {
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch {
        /* ignore */
      }
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {
        /* ignore */
      }
      this.source = null;
    }
    if (this.gain) {
      try {
        this.gain.disconnect();
      } catch {
        /* ignore */
      }
      this.gain = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {
        /* ignore */
      }
      this.audioContext = null;
    }
  }

  _teardownAudio() {
    this._teardownCapture();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  _handleSocketMessage(raw) {
    if (!this.active || this.ignoreTranscripts) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type === "UtteranceEnd") {
      this._flushUtterance();
      return;
    }
    if (data.type !== "Results") return;

    const transcript = data.channel?.alternatives?.[0]?.transcript?.trim() || "";

    if (data.is_final) {
      if (transcript) this.finalPieces.push(transcript);
      this.interimText = "";
      this._emitTranscript(joinTranscript(this.finalPieces, ""));
      this._armUtteranceTimer();
      return;
    }

    this.interimText = transcript;
    this._emitTranscript(joinTranscript(this.finalPieces, this.interimText));
    if (this.finalPieces.length || this.interimText) this._armUtteranceTimer();
  }

  _clearUtteranceTimer() {
    if (this.utteranceTimer) {
      clearTimeout(this.utteranceTimer);
      this.utteranceTimer = null;
    }
  }

  _armUtteranceTimer() {
    this._clearUtteranceTimer();
    this.utteranceTimer = setTimeout(() => this._flushUtterance(), UTTERANCE_SILENCE_MS);
  }

  _flushUtterance() {
    if (this.flushing || this.ignoreTranscripts) return;
    this._clearUtteranceTimer();
    const text = joinTranscript(this.finalPieces, this.interimText);
    this.finalPieces = [];
    this.interimText = "";
    if (!text) {
      this._emitTranscript("");
      return;
    }

    if (this.continuous) {
      this._emitTranscript(text);
      this.options.onUtterance?.(text);
      // Clear right away — once handed off, this sentence becomes a real
      // turn/committed line elsewhere; leaving it here would show it a
      // second time as a stale "live" bubble until the next utterance.
      this._emitTranscript("");
      return;
    }

    this.flushing = true;
    this.pauseForTurn();
    this._emitTranscript(text);
    Promise.resolve(this.options.onUtterance?.(text))
      .catch(() => {
        /* host surfaces errors */
      })
      .then(() => {
        this.flushing = false;
        this.resumeAfterTurn();
      });
  }
}
