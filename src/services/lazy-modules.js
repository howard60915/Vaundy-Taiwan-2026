import { FURIGANA_CORRECTIONS } from "../furigana-corrections.js";

let furiganaPromise = null;
let karaokeSourcesPromise = null;
let furiganaCorrectionsApplied = false;

function applyFuriganaCorrections(){
  if (!window.JP_FURIGANA || furiganaCorrectionsApplied) return;
  window.JP_FURIGANA = Object.freeze({
    ...window.JP_FURIGANA,
    ...FURIGANA_CORRECTIONS
  });
  furiganaCorrectionsApplied = true;
}

export function loadFurigana(){
  if (window.JP_FURIGANA || window.JP_ROMAJI){
    applyFuriganaCorrections();
    return Promise.resolve();
  }
  if (!furiganaPromise){
    furiganaPromise = import("../../furigana.js")
      .then(() => {
        applyFuriganaCorrections();
      })
      .catch(() => undefined);
  }
  return furiganaPromise;
}

export function loadKaraokeSources(){
  if (window.KARAOKE_SOURCES) return Promise.resolve(window.KARAOKE_SOURCES);
  if (!karaokeSourcesPromise){
    karaokeSourcesPromise = import("../../karaoke-sources.js")
      .then(() => window.KARAOKE_SOURCES || null)
      .catch(() => null);
  }
  return karaokeSourcesPromise;
}
