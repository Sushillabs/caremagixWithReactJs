import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";

const inputCls =
  "w-full min-w-0 rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none";

const pad2 = (n) => String(n).padStart(2, "0");
const todayDate = (now) => `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
const nowTime = (now) => `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

export default function SignatureBlock({ base }) {
  const { register, setValue, getValues } = useFormContext();
  const image = useWatch({ name: `${base}.image` }) ?? "";
  const padRef = useRef(null);
  const [drawnHere, setDrawnHere] = useState(false);

  useEffect(() => {
    if (!image) {
      padRef.current?.clear();
      setDrawnHere(false);
    }
  }, [image]);

  const showSaved = image && !drawnHere;

  // The card starts collapsed, so the canvas mounts at 0px wide; resize it once it is visible.
  useEffect(() => {
    const canvas = padRef.current?.getCanvas();
    if (!canvas) return undefined;
    const observer = new ResizeObserver(() => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = Math.round(canvas.offsetWidth * ratio);
      if (!width || canvas.width === width) return;
      canvas.width = width;
      canvas.height = Math.round(canvas.offsetHeight * ratio);
      canvas.getContext("2d").scale(ratio, ratio);
      padRef.current.clear();
      setDrawnHere(false);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [showSaved]);

  const saveDrawing = () => {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) return;
    setDrawnHere(true);
    setValue(`${base}.image`, pad.getTrimmedCanvas().toDataURL("image/png"));
    if (!getValues(`${base}.date`)) {
      const now = new Date();
      setValue(`${base}.date`, todayDate(now));
      setValue(`${base}.time`, nowTime(now));
    }
  };

  const clear = () => {
    padRef.current?.clear();
    setDrawnHere(false);
    setValue(`${base}.image`, "");
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-600">Staff signature</span>
          <button type="button" onClick={clear} className="min-h-8 px-2 text-xs text-emerald-700 hover:underline">
            {showSaved ? "Clear and sign again" : "Clear"}
          </button>
        </div>
        {showSaved ? (
          <img
            src={image}
            alt="Saved staff signature"
            className="mt-1 h-28 w-full rounded border border-gray-300 bg-white object-contain p-2"
          />
        ) : (
          <>
            <SignatureCanvas
              ref={padRef}
              penColor="#1e3a8a"
              clearOnResize={false}
              onEnd={saveDrawing}
              canvasProps={{
                "aria-label": "Signature pad",
                className: "mt-1 h-28 w-full rounded border border-dashed border-gray-300 bg-white",
              }}
            />
            {!image && <p className="mt-1 text-xs text-gray-400">Sign above with your finger or mouse.</p>}
          </>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-600">Title</span>
          <input {...register(`${base}.title`)} placeholder="RN" maxLength={40} className={inputCls} />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-600">Date</span>
          <input {...register(`${base}.date`)} type="date" className={inputCls} />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[11px] font-medium text-gray-600">Time</span>
          <input {...register(`${base}.time`)} type="time" className={inputCls} />
        </label>
      </div>
    </div>
  );
}
