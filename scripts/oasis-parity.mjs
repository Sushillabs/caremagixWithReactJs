// Compares the React OASIS payloads with the legacy jQuery page's own output.
// The legacy page runs for real in headless Chromium. Its save requests are caught and
// answered locally, and every other request except the page's files and jQuery is
// blocked, so nothing reaches a backend.
//
//   node scripts/oasis-parity.mjs ROC C:/path/to/caremagix-fe/oasis-roc.html [cases]
//
// Checks: getRawFormData() on random forms (fill), the same after legacy reloads its own
// payload (review), the blank form as opened (defaults), and the Save, Send for Review
// and Export JSON payloads.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";

const [formType, legacyHtml, casesArg] = process.argv.slice(2);
if (!formType || !legacyHtml) {
  console.error("usage: node scripts/oasis-parity.mjs <FORM> <legacy html path> [cases]");
  process.exit(2);
}
const CASES = Number(casesArg) || 2000;
const BATCH = 20;
const PATIENT_NAME = "Parity Test";
const PATIENT_ID = "999999";
const REVIEWER = "parity@example.test";

const oasisDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/features/oasis");
const bundlePath = path.join(os.tmpdir(), `oasis-parity-${process.pid}.mjs`);
await build({
  stdin: {
    contents: `
      import fu from "./schemas/fu.schema";
      import roc from "./schemas/roc.schema";
      import dah from "./schemas/dah.schema";
      import trn from "./schemas/trn.schema";
      import dc from "./schemas/dc.schema";
      import soc from "./schemas/soc.schema";
      export const SCHEMAS = { FU: fu, ROC: roc, DAH: dah, TRN: trn, DC: dc, SOC: soc };
      export { FIELD_WIDGETS } from "./engine/schema";
      export {
        fieldLeaves, collectPayload, normalizeLoadedValues, applyDefaults,
        buildSavePayload, buildExportData, exportFileName,
      } from "./engine/payload";
      export { applySkipMarks } from "./engine/skipLogic";
    `,
    resolveDir: oasisDir,
  },
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: bundlePath,
  logLevel: "error",
});
const {
  SCHEMAS,
  FIELD_WIDGETS: W,
  fieldLeaves,
  collectPayload,
  normalizeLoadedValues,
  applyDefaults,
  buildSavePayload,
  buildExportData,
  exportFileName,
  applySkipMarks,
} = await import(pathToFileURL(bundlePath).href);
fs.rmSync(bundlePath, { force: true });

const schema = SCHEMAS[formType.toUpperCase()];
if (!schema) {
  console.error(`No schema registered for "${formType}". Known: ${Object.keys(SCHEMAS).join(", ")}`);
  process.exit(2);
}

let seed = 20260930;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (list) => list[Math.floor(rand() * list.length)];

const CODE_POOL = ["", "", "0", "1", "2", "3", "9", "-", "01", "03", "06", "07", "09", "10", "88"];
const NUMBER_POOL = ["", "", "0", "1", "2", "7", "15", "99"];
const TEXT_POOL = ["", "English", "Spanish", "I10", "E11.9", "M17.11"];
const SEVERITY_POOL = ["", "0", "1", "2", "3", "4"];
const DATE_POOLS = {
  month: ["", "01", "03", "12"],
  day: ["", "01", "15", "28"],
  year: ["", "2026"],
};

const codeOf = (maxLength) => pick(CODE_POOL.filter((c) => c.length <= (maxLength ?? 2)));

// One generator per payload key: returns { key, value, kind, mode }.
function generators(field) {
  const bool = (key) => () => ({ key, value: rand() < 0.5, kind: "checkbox" });
  const paired = field.pairedField ? [bool(field.pairedField.fieldId)] : [];

  switch (field.widget) {
    case W.CODED_RADIO:
    case W.LIVING_GRID:
    case W.BUTTON_GROUP: {
      const values = (field.options ?? []).map((o) => o.value);
      return [
        () => {
          const roll = rand();
          if (values.length && roll < 0.7) {
            return { key: field.fieldId, value: pick(values), kind: "coded", mode: rand() < 0.5 ? "click" : "type" };
          }
          const value = roll < 0.85 ? "" : codeOf(field.maxLength);
          return { key: field.fieldId, value, kind: "coded", mode: "type" };
        },
      ];
    }
    case W.CHECKBOX_GROUP:
    case W.CHECKBOX_TABLE:
      return fieldLeaves(field).map((leaf) => bool(leaf.id));
    case W.SPLIT_DATE:
      return [
        ...["month", "day", "year"].map((part) => () => ({
          key: `${field.fieldId}_${part}`,
          value: pick(DATE_POOLS[part]),
          kind: "text",
        })),
        ...paired,
      ];
    case W.NUMERIC:
      return [() => ({ key: field.fieldId, value: pick(NUMBER_POOL), kind: "text" })];
    case W.COUNT_GRID:
      return field.rows.map((row) => () => ({ key: row.fieldId, value: pick(NUMBER_POOL), kind: "text" }));
    case W.GG_MATRIX:
      return field.rows.map((row) => () => ({ key: row.fieldId, value: codeOf(row.maxLength), kind: "text" }));
    case W.CODE_TABLE:
      return field.tableRows
        .flatMap((row) =>
          row.fieldIds.map((key, i) => key && (() => ({ key, value: codeOf(field.columns[i].maxLength), kind: "text" })))
        )
        .filter(Boolean);
    case W.DIAGNOSIS_TABLE:
      return field.diagnosisRows.flatMap((row) => [
        () => ({ key: row.icdFieldId, value: pick(TEXT_POOL), kind: "text" }),
        () => ({ key: row.severityFieldId, value: pick(SEVERITY_POOL), kind: "severity" }),
      ]);
    case W.RADIO_TABLE: {
      const values = field.options.map((o) => o.value);
      return field.radioRows.map((row) => () => ({
        key: row.fieldId,
        value: rand() < 0.3 ? "" : pick(values),
        kind: "radio",
      }));
    }
    case W.TEXT:
    case W.TEXT_UNKNOWN:
    case W.HIDDEN:
      return [() => ({ key: field.fieldId, value: pick(TEXT_POOL), kind: "text" }), ...paired];
    default:
      return [];
  }
}

const allGenerators = schema.sections.flatMap((s) => s.items.flatMap(generators));

function makeCase(index) {
  if (index === 0) return [];
  return allGenerators.map((gen) => gen());
}

const valuesOf = (entries) => Object.fromEntries(entries.map((e) => [e.key, e.value]));
const reactPayload = (entries) => applySkipMarks(schema, collectPayload(schema, valuesOf(entries)));
const withoutSavedAt = (data) => {
  if (!data?._meta) return data;
  const { savedAt, ...meta } = data._meta;
  return { ...data, _meta: { ...meta, savedAt: savedAt ? "<time>" : savedAt } };
};

const browser = await chromium.launch();
const context = await browser.newContext();
const blocked = new Set();
const savePosts = [];
await context.route("**/*", (route) => {
  const request = route.request();
  const url = request.url();
  if (url.startsWith("file://") || /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jquery\//.test(url)) {
    return route.continue();
  }
  if (request.method() === "POST" && new URL(url).pathname.endsWith("/save_oasis_json")) {
    savePosts.push(JSON.parse(request.postData() || "{}"));
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  }
  blocked.add(new URL(url).host);
  return route.abort();
});
const page = await context.newPage();
page.on("dialog", (dialog) => dialog.dismiss());

const pageUrl = `${pathToFileURL(path.resolve(legacyHtml)).href}?${new URLSearchParams({
  patient_name: PATIENT_NAME,
  patient_id: PATIENT_ID,
})}`;

// Runs inside the legacy page.
function installHelpers() {
  const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

  const reset = () => {
    document.querySelectorAll("input[data-field], textarea[data-field], select[data-field]").forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") el.checked = false;
      else el.value = "";
    });
    document.querySelectorAll('input[type="radio"]').forEach((el) => (el.checked = false));
    document.querySelectorAll(".sev-btn.active").forEach((el) => el.classList.remove("active"));
  };

  const apply = ({ key, value, kind, mode }) => {
    if (kind === "radio") {
      if (value === "") return null;
      const radio = document.querySelector(`input[type="radio"][name="${key}"][value="${value}"]`);
      if (!radio) return `no radio ${key}=${value}`;
      radio.click();
      return null;
    }
    const inputs = [...document.querySelectorAll(`input[data-field="${key}"], textarea[data-field="${key}"], select[data-field="${key}"]`)];
    if (!inputs.length) return `no element for ${key}`;
    const el = inputs[0];

    // Only coded fields get events: their handlers sync radios, which the payload reads.
    // Plain fields are read straight from the DOM, and legacy's per-event progress
    // recalculation is slow enough to matter over thousands of cases.
    if (kind === "checkbox") {
      el.checked = value;
    } else if (kind === "severity") {
      if (value === "") return null;
      if (typeof window.setSev === "function" && document.getElementById(`hidden_${key}`)) {
        window.setSev(key, Number(value));
      } else {
        el.value = value;
      }
    } else if (kind === "coded" && mode === "click" && document.querySelector(`input[type="radio"][name="${el.id || key}"][value="${value}"]`)) {
      document.querySelector(`input[type="radio"][name="${el.id || key}"][value="${value}"]`).click();
    } else {
      // Typed values, and answers the legacy page has no radio for (DC M2102), go into the box.
      el.value = value;
      if (kind === "coded") fire(el, "input");
    }
    return null;
  };

  window.__parity = { reset, apply };
}

async function openPage() {
  await page.goto(pageUrl);
  await page.waitForFunction(() => typeof window.getRawFormData === "function" && !!window.jQuery, null, {
    timeout: 30000,
  });
  await page.waitForTimeout(800); // legacy applies its default values 300 ms after load
  await page.evaluate(installHelpers);
}

await openPage();
await page.evaluate(() => localStorage.clear());

const runBatch = (batch) =>
  page.evaluate((cases) => {
    const { reset, apply } = window.__parity;
    return cases.map((entries) => {
      reset();
      const problems = entries.map(apply).filter(Boolean);
      const payload = window.getRawFormData();

      // Review round trip: what legacy sends after reopening its own saved payload.
      let reloaded = null;
      if (typeof window.applyData === "function") {
        reset();
        window.applyData(payload);
        document.dispatchEvent(new CustomEvent("oasis:dataApplied", { detail: payload }));
        reloaded = window.getRawFormData();
      }
      return { payload, reloaded, problems };
    });
  }, batch);

const diffKeys = (legacy, mine) =>
  [...new Set([...Object.keys(legacy), ...Object.keys(mine)])].filter(
    (k) => JSON.stringify(legacy[k]) !== JSON.stringify(mine[k])
  );

let compared = 0;
let reloadCompared = 0;
let failedCases = 0;
const diffCounts = {};
const examples = [];
const problems = new Set();
let legacyKeyCount = null;

const record = (label, legacyPayload, mine) => {
  const diffs = diffKeys(legacyPayload, mine);
  for (const key of diffs) {
    diffCounts[`${label}:${key}`] = (diffCounts[`${label}:${key}`] ?? 0) + 1;
    if (examples.length < 10) {
      examples.push(`${label} ${key}: legacy=${JSON.stringify(legacyPayload[key])} react=${JSON.stringify(mine[key])}`);
    }
  }
  return diffs.length;
};

for (let start = 0; start < CASES; start += BATCH) {
  const batch = Array.from({ length: Math.min(BATCH, CASES - start) }, (_, i) => makeCase(start + i));
  const results = await runBatch(batch);
  process.stderr.write(`\r${Math.min(start + BATCH, CASES)}/${CASES}`);

  results.forEach(({ payload: legacy, reloaded, problems: caseProblems }, i) => {
    caseProblems.forEach((p) => problems.add(p));
    legacyKeyCount ??= Object.keys(legacy).length;
    compared++;

    let bad = record(`fill#${start + i}`, legacy, reactPayload(batch[i]));
    if (reloaded) {
      reloadCompared++;
      const mine = applySkipMarks(schema, collectPayload(schema, normalizeLoadedValues(schema, legacy)));
      bad += record(`reload#${start + i}`, reloaded, mine);
    }
    if (bad) failedCases++;
  });
}
process.stderr.write("\n");

// Whole-payload checks on a freshly opened page.
const extras = [];
const extra = (name, legacy, mine) => {
  const diffs = legacy === undefined ? ["(legacy produced nothing)"] : diffKeys(legacy, mine);
  extras.push({ name, ok: diffs.length === 0, diffs: diffs.slice(0, 8) });
  diffs.slice(0, 3).forEach((k) =>
    examples.push(`${name} ${k}: legacy=${JSON.stringify(legacy?.[k])} react=${JSON.stringify(mine?.[k])}`)
  );
};

await page.evaluate(() => localStorage.clear());
await openPage();

const opened = await page.evaluate(() => window.getRawFormData());
extra("opened blank form (defaults)", opened, applySkipMarks(schema, collectPayload(schema, applyDefaults(schema, {}))));

const sample = makeCase(1);
await page.evaluate((entries) => {
  window.__parity.reset();
  entries.forEach(window.__parity.apply);
}, sample);
const sampleValues = valuesOf(sample);

const waitForPost = async (count) => {
  for (let i = 0; i < 50 && savePosts.length < count; i++) await page.waitForTimeout(100);
  return savePosts[count - 1];
};

let topLevel = {};
if (await page.evaluate(() => typeof window.manualSave === "function")) {
  await page.evaluate(() => window.manualSave());
  const post = await waitForPost(1);
  topLevel.save = post ? Object.keys(post) : null;
  extra("Save mapped_data", withoutSavedAt(post?.mapped_data), withoutSavedAt(buildSavePayload(schema, sampleValues)));
}

if (await page.evaluate(() => typeof window.sendForReview === "function" && !!document.getElementById("reviewerEmail"))) {
  const before = savePosts.length;
  await page.evaluate((email) => {
    document.getElementById("reviewerEmail").value = email;
    return window.sendForReview();
  }, REVIEWER);
  const post = await waitForPost(before + 1);
  topLevel.sendForReview = post ? Object.keys(post) : null;
  extra(
    "Send for Review mapped_data",
    withoutSavedAt(post?.mapped_data),
    withoutSavedAt(buildSavePayload(schema, sampleValues))
  );
  extras.push({
    name: "Send for Review reviewer_email",
    ok: post?.reviewer_email === REVIEWER,
    diffs: post?.reviewer_email === REVIEWER ? [] : [String(post?.reviewer_email)],
  });
}

if (await page.evaluate(() => typeof window.exportJSON === "function")) {
  const exported = await page.evaluate(async () => {
    let blob = null;
    let fileName = null;
    const originalCreate = URL.createObjectURL;
    const originalClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = (b) => {
      blob = b;
      return "blob:parity";
    };
    HTMLAnchorElement.prototype.click = function () {
      fileName = this.download;
    };
    try {
      window.exportJSON();
    } finally {
      URL.createObjectURL = originalCreate;
      HTMLAnchorElement.prototype.click = originalClick;
    }
    return { text: blob ? await blob.text() : null, fileName };
  });
  const legacyFile = exported.text ? JSON.parse(exported.text) : undefined;
  extra("Export JSON content", withoutSavedAt(legacyFile), withoutSavedAt(buildExportData(schema, sampleValues)));
  const myName = exportFileName(schema, PATIENT_NAME);
  extras.push({
    name: "Export JSON file name",
    ok: exported.fileName === myName,
    diffs: exported.fileName === myName ? [] : [`legacy=${exported.fileName} react=${myName}`],
  });
}

await browser.close();

console.log(`form: ${schema.formKey} (${schema.legacyEngine ?? "core"} engine)`);
console.log(`legacy keys in an empty form: ${legacyKeyCount}`);
console.log(`cases compared: ${compared}`);
console.log(`reload round trips compared: ${reloadCompared}`);
console.log(`cases with differences: ${failedCases}`);
console.log("whole-payload checks:");
extras.forEach((e) => console.log(`  ${e.ok ? "ok  " : "DIFF"} ${e.name}${e.ok ? "" : ` -> ${e.diffs.join(", ")}`}`));
console.log("legacy request top-level keys:", JSON.stringify(topLevel));
if (failedCases || extras.some((e) => !e.ok)) {
  console.log("keys that differed (count):", diffCounts);
  console.log("examples:\n  " + examples.join("\n  "));
}
if (problems.size) console.log("fill problems:", [...problems].slice(0, 20));
console.log(`save requests caught locally (never sent): ${savePosts.length}`);
console.log("blocked hosts:", [...blocked]);
process.exit(failedCases || problems.size || extras.some((e) => !e.ok) ? 1 : 0);
