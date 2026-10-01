import { SKIP_MARK } from "../../engine/skipLogic";

export const GG_NOT_ATTEMPTED = ["07", "09", "10", "88"];

export const markWhen = (fieldId, values, mark) => ({
  when: (d) => [].concat(values).includes(d[fieldId]),
  mark,
});

export const markWhenFilled = (fieldId, mark) => ({
  when: (d) => !!d[fieldId] && d[fieldId] !== SKIP_MARK,
  mark,
});

export const dateParts = (base) => [`${base}_month`, `${base}_day`, `${base}_year`];
