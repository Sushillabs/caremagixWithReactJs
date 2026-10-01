// Compares the React OASIS payload with the legacy jQuery page's own getRawFormData().
// The legacy page runs for real in headless Chromium; every request except the page's
// files and jQuery is blocked, so nothing reaches a backend.
//
//   node scripts/oasis-parity.mjs ROC C:/path/to/caremagix-fe/oasis-roc.html [cases]

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

const oasisDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/features/oasis");
const bundlePath = path.join(os.tmpdir(), `oasis-parity-${process.pid}.mjs`);
await build({
  stdin: {
    contents: `
      import fu from "./schemas/fu.schema";
      import roc from "./schemas/roc.schema";
      export const SCHEMAS = { FU: fu, ROC: roc };
      export { FIELD_WIDGETS } from "./engine/schema";
      export { fieldLeaves, collectPayload, normalizeLoadedValues } from "./engine/payload";
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
const { SCHEMAS, FIELD_WIDGETS: W, fieldLeaves, collectPayload, normalizeLoadedValues, applySkipMarks } = await import(
  pathToFileURL(bundlePath).href
);
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
      return field.tableRows.flatMap((row) =>
        row.fieldIds.map((key, i) => key && (() => ({ key, value: codeOf(field.columns[i].maxLength), kind: "text" })))
      ).filter(Boolean);
    case W.DIAGNOSIS_TABLE:
      return field.diagnosisRows.flatMap((row) => [
        () => ({ key: row.icdFieldId, value: pick(TEXT_POOL), kind: "text" }),
        () => ({ key: row.severityFieldId, value: pick(SEVERITY_POOL), kind: "severity" }),
      ]);
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

const reactPayload = (entries) => {
  const values = Object.fromEntries(entries.map((e) => [e.key, e.value]));
  return applySkipMarks(schema, collectPayload(schema, values));
};

const browser = await chromium.launch();
const context = await browser.newContext();
const blocked = new Set();
await context.route("**/*", (route) => {
  const url = route.request().url();
  if (url.startsWith("file://") || /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jquery\//.test(url)) {
    return route.continue();
  }
  blocked.add(new URL(url).host);
  return route.abort();
});
const page = await context.newPage();
page.on("dialog", (dialog) => dialog.dismiss());
await page.goto(pathToFileURL(path.resolve(legacyHtml)).href);
await page.waitForFunction(() => typeof window.getRawFormData === "function" && !!window.jQuery, null, {
  timeout: 30000,
});
await page.waitForTimeout(500);

const runBatch = (batch) =>
  page.evaluate((cases) => {
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
      } else if (kind === "coded" && mode === "click") {
        const radio = document.querySelector(`input[type="radio"][name="${el.id || key}"][value="${value}"]`);
        if (!radio) return `no radio ${el.id || key}=${value}`;
        radio.click();
      } else {
        el.value = value;
        if (kind === "coded") fire(el, "input");
      }
      return null;
    };

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
  [...new Set([...Object.keys(legacy), ...Object.keys(mine)])].filter((k) => legacy[k] !== mine[k]);

let compared = 0;
let reloadCompared = 0;
let failedCases = 0;
const diffCounts = {};
const examples = [];
const problems = new Set();
let legacyKeyCount = null;

for (let start = 0; start < CASES; start += BATCH) {
  const batch = Array.from({ length: Math.min(BATCH, CASES - start) }, (_, i) => makeCase(start + i));
  const results = await runBatch(batch);
  process.stderr.write(`\r${Math.min(start + BATCH, CASES)}/${CASES}`);

  results.forEach(({ payload: legacy, reloaded, problems: caseProblems }, i) => {
    caseProblems.forEach((p) => problems.add(p));
    legacyKeyCount ??= Object.keys(legacy).length;
    compared++;

    const record = (label, legacyPayload, mine) => {
      const diffs = diffKeys(legacyPayload, mine);
      for (const key of diffs) {
        diffCounts[`${label}:${key}`] = (diffCounts[`${label}:${key}`] ?? 0) + 1;
        if (examples.length < 10) {
          examples.push(
            `case ${start + i} ${label} ${key}: legacy=${JSON.stringify(legacyPayload[key])} react=${JSON.stringify(mine[key])}`
          );
        }
      }
      return diffs.length;
    };

    let bad = record("fill", legacy, reactPayload(batch[i]));
    if (reloaded) {
      reloadCompared++;
      const mine = applySkipMarks(schema, collectPayload(schema, normalizeLoadedValues(schema, legacy)));
      bad += record("reload", reloaded, mine);
    }
    if (bad) failedCases++;
  });
}

await browser.close();

process.stderr.write("\n");
console.log(`form: ${schema.formKey}`);
console.log(`legacy keys in an empty form: ${legacyKeyCount}`);
console.log(`cases compared: ${compared}`);
console.log(`reload round trips compared: ${reloadCompared}`);
console.log(`cases with differences: ${failedCases}`);
if (failedCases) {
  console.log("keys that differed (count):", diffCounts);
  console.log("examples:\n  " + examples.join("\n  "));
}
if (problems.size) console.log("fill problems:", [...problems].slice(0, 20));
console.log("blocked hosts:", [...blocked]);
process.exit(failedCases || problems.size ? 1 : 0);
