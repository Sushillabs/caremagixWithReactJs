export const CONSOLIDATED_DOC = "Consolidated Med Summary";
export const SEARCH_MIN_ITEMS = 5;

// Doc names use 2026-10-30, users type 10/30/2026 or 10/30.
function toIsoText(query) {
  const parts = query.split("/");
  if (parts.length < 2) return null;

  const month = parts[0].padStart(2, "0");
  const day = parts[1].padStart(2, "0");
  const year = parts[2];

  if (year) return `${year}-${month}-${day}`;
  return `-${month}-${day}`;
}

export function filterDocs(items, search) {
  const query = search.trim().toLowerCase();
  if (!query) return items;

  const isoText = toIsoText(query);

  const isMatch = (item) => {
    const name = item.toLowerCase();
    if (name.includes(query)) return true;
    if (isoText && name.includes(isoText)) return true;
    return false;
  };

  const matches = items.filter((item) => item !== CONSOLIDATED_DOC && isMatch(item));
  const hasConsolidated = items.includes(CONSOLIDATED_DOC);

  if (hasConsolidated && (matches.length > 0 || isMatch(CONSOLIDATED_DOC))) {
    return [CONSOLIDATED_DOC, ...matches];
  }
  return matches;
}
