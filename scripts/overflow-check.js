// Paste into the browser DevTools Console on any page to list elements sticking out past the screen edge.
(() => {
  const vw = document.documentElement.clientWidth;
  // Only strips built to scroll sideways count; a vertical scroller (overflow-y-auto) also reports overflow-x auto.
  const insideScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (p.classList.contains("overflow-x-auto") || p.classList.contains("overflow-auto")) return true;
    }
    return false;
  };
  document.querySelectorAll("[data-overflow-flag]").forEach((el) => {
    el.style.outline = "";
    el.removeAttribute("data-overflow-flag");
  });
  const hits = [...document.body.querySelectorAll("*")].filter((el) => {
    if (el instanceof SVGElement || !el.getClientRects().length) return false;
    const r = el.getBoundingClientRect();
    return (r.right > vw + 1 || r.left < -1) && r.width > 0 && !insideScroller(el);
  });
  const outermost = hits.filter((el) => !hits.some((other) => other !== el && other.contains(el) && other !== document.body));
  outermost.forEach((el) => {
    el.style.outline = "2px solid red";
    el.setAttribute("data-overflow-flag", "");
  });
  const pageScrollsSideways = document.documentElement.scrollWidth > vw;
  console.log(
    `%c${outermost.length ? `${outermost.length} element(s) overflow` : "No overflow"}  |  width ${vw}px  |  page scrolls sideways: ${pageScrollsSideways ? "YES" : "no"}`,
    `font-weight:bold;color:${outermost.length || pageScrollsSideways ? "red" : "green"}`
  );
  if (outermost.length) {
    console.table(
      outermost.map((el) => ({
        element: el.tagName.toLowerCase(),
        text: (el.innerText || "").trim().slice(0, 40),
        right: Math.round(el.getBoundingClientRect().right),
        className: String(el.className).slice(0, 60),
      }))
    );
  }
  return outermost;
})();
