const DEFAULT_FONT_WEIGHTS = [400, 500, 700];
const JAPANESE_CHAR_RE = /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
let activeLink = null;
let activeKey = "";

function ensureFontPreconnect(href, crossOrigin = false){
  if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = href;
  if (crossOrigin) link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

function japaneseCharacters(value){
  const source = Array.isArray(value) ? value.join("") : String(value ?? "");
  return [...new Set([...source].filter(char => JAPANESE_CHAR_RE.test(char)))]
    .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
    .join("");
}

export function loadJapaneseFontSubset(text, weights = DEFAULT_FONT_WEIGHTS){
  const characters = japaneseCharacters(text);
  if (!characters) return;
  const selectedWeights = [...new Set(weights)]
    .map(Number)
    .filter(weight => Number.isInteger(weight) && weight >= 100 && weight <= 900)
    .sort((a, b) => a - b);
  if (!selectedWeights.length) return;

  const key = `${selectedWeights.join(",")}:${characters}`;
  if (activeLink?.isConnected && activeKey === key) return;
  activeLink?.remove();

  const params = new URLSearchParams({
    family: `Noto Sans JP:wght@${selectedWeights.join(";")}`,
    display: "swap",
    text: characters
  });
  ensureFontPreconnect("https://fonts.googleapis.com");
  ensureFontPreconnect("https://fonts.gstatic.com", true);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${params.toString()}`;
  link.dataset.japaneseFontSubset = "true";
  activeKey = key;
  activeLink = link;
  document.head.appendChild(link);
}
