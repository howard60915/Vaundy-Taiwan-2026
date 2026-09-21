import { FURIGANA_CORRECTIONS, ROMAJI_CORRECTIONS } from "../furigana-corrections.js";

let furiganaPromise = null;
let karaokeSourcesPromise = null;
let furiganaCorrectionsApplied = false;

function applyFuriganaCorrections(){
  if (furiganaCorrectionsApplied) return;
  if (window.JP_FURIGANA){
    window.JP_FURIGANA = Object.freeze({
      ...window.JP_FURIGANA,
      ...FURIGANA_CORRECTIONS
    });
  }
  if (window.JP_ROMAJI){
    window.JP_ROMAJI = Object.freeze({
      ...window.JP_ROMAJI,
      ...ROMAJI_CORRECTIONS
    });
  }
  if (!window.JP_FURIGANA && !window.JP_ROMAJI) return;
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
