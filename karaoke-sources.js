/*
 * Open timed-lyrics adapters.
 *
 * The page keeps its hand-edited Japanese/translation lyrics as the display
 * source.  This file only fetches word timings and converts the formats used
 * by open lyric providers into one small, TTML-like model:
 *
 *   {
 *     format: "timed-lyrics-v1",
 *     lines: [{ start, end, words: [{ text, start, end }] }]
 *   }
 *
 * Keeping this boundary separate means a provider can disappear without
 * changing the renderer.  The default worker is the public backend used by
 * Beautiful Lyrics Reborn; it races the open Musixmatch RichSync, QQ QRC,
 * KuGou KRC and NetEase YRC providers.  AMLL TTML DB is tried afterwards as
 * a direct, CORS-enabled fallback.
 */
(function (root) {
  "use strict";

  const CACHE_VERSION = "v2";
  const CACHE_PREFIX = "horo-karaoke-";
  const DEFAULT_WORKER = "https://lyrics.txw.qzz.io";
  const AMLL_API = "https://api.amll.dev";
  const LRCLIB_API = "https://lrclib.net/api";
  const PROVIDER_ORDER = Object.freeze([
    "Musixmatch RichSync",
    "QQ Music QRC",
    "KuGou KRC",
    "NetEase YRC",
    "AMLL TTML DB",
    "LRCLIB lyricsfile（逐行時間）"
  ]);
  const pending = new Map();

  function finite(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function normaliseText(value) {
    return String(value == null ? "" : value)
      .normalize("NFKC")
      .replace(/[\[(](?:wave|clap|mic|chant|jump|spin|turn)[\])]/gi, "")
      .toLocaleLowerCase()
      .replace(/[\s\u3000、。！？!?.,，．・「」『』（）()\[\]{}【】<>《》:：;；…—–_「」『』“”‘’]/g, "");
  }

  function parseTime(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const text = String(value == null ? "" : value).trim();
    if (!text) return null;
    if (/^-?\d+(?:\.\d+)?$/.test(text)) return Number(text);
    const unit = text.match(/^(-?\d+(?:\.\d+)?)(ms|s)$/i);
    if (unit) return Number(unit[1]) * (unit[2].toLowerCase() === "ms" ? 0.001 : 1);
    const clock = text.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[.:](\d+))?$/);
    if (!clock) return null;
    const hours = Number(clock[1] || 0);
    const minutes = Number(clock[2] || 0);
    const seconds = Number(clock[3] || 0);
    const fraction = clock[4] ? Number(`0.${clock[4]}`) : 0;
    return hours * 3600 + minutes * 60 + seconds + fraction;
  }

  function normaliseWords(rawWords) {
    if (!Array.isArray(rawWords)) return [];
    const out = [];
    rawWords.forEach((raw, index) => {
      if (!raw || typeof raw !== "object") return;
      const text = String(raw.text ?? raw.Text ?? raw.c ?? "");
      if (!text) return;
      const start = parseTime(raw.start ?? raw.StartTime ?? raw.ts ?? raw.time);
      let end = parseTime(raw.end ?? raw.EndTime ?? raw.te);
      const next = rawWords[index + 1];
      const nextStart = next && parseTime(next.start ?? next.StartTime ?? next.ts ?? next.time);
      if (end == null && nextStart != null) end = nextStart;
      if (start == null) return;
      if (end == null || end <= start) end = start + 0.04;
      out.push({ text, start, end });
    });
    return out;
  }

  function normaliseLines(lines, sourceName) {
    if (!Array.isArray(lines)) return null;
    const result = lines.map((line) => {
      const words = normaliseWords(line && (line.words || line.Syllables || line.syllables));
      if (!words.length) return null;
      const start = finite(line.start ?? line.StartTime) ?? words[0].start;
      const end = Math.max(
        finite(line.end ?? line.EndTime) ?? words[words.length - 1].end,
        words[words.length - 1].end
      );
      return {
        start: Math.max(0, start),
        end: Math.max(start + 0.04, end),
        text: words.map((word) => word.text).join(""),
        words
      };
    }).filter(Boolean).sort((a, b) => a.start - b.start);

    if (!result.length) return null;
    return {
      format: "timed-lyrics-v1",
      source: sourceName || "open timed lyrics",
      lines: result
    };
  }

  function normaliseBeautifulLyrics(payload) {
    if (!payload || typeof payload !== "object") return null;
    const type = String(payload.Type ?? payload.type ?? "").toLowerCase();
    if (type !== "syllable" && !Array.isArray(payload.Content) && !Array.isArray(payload.content)) return null;
    const content = payload.Content || payload.content || [];
    const lines = [];
    content.forEach((entry) => {
      if (!entry || String(entry.Type ?? entry.type ?? "").toLowerCase() !== "vocal") return;
      const lead = entry.Lead || entry.lead || entry;
      const syllables = lead.Syllables || lead.syllables || [];
      const words = syllables.map((word) => ({
        text: word.Text ?? word.text ?? "",
        start: word.StartTime ?? word.start,
        end: word.EndTime ?? word.end
      }));
      const line = normaliseLines([{
        start: lead.StartTime ?? lead.start,
        end: lead.EndTime ?? lead.end,
        words
      }], "");
      if (line) lines.push(line.lines[0]);
    });
    return normaliseLines(lines, "open provider pool");
  }

  function parseEnhancedLrc(text) {
    const lines = [];
    String(text || "").split(/\r?\n/).forEach((rawLine) => {
      const match = rawLine.match(/^\s*\[(\d+):(\d{1,2}(?:\.\d+)?)\](.*)$/);
      if (!match) return;
      const lineStart = Number(match[1]) * 60 + Number(match[2]);
      const body = match[3] || "";
      const timed = [];
      const token = /<((?:\d+:)?\d{1,2}:\d{1,2}(?:[.:]\d+)?)>/g;
      let cursor = 0;
      let hit;
      while ((hit = token.exec(body))) {
        if (cursor < hit.index && timed.length) {
          timed[timed.length - 1].text += body.slice(cursor, hit.index);
        }
        const start = parseTime(hit[1]);
        if (start != null) timed.push({ text: "", start, end: start + 0.04 });
        cursor = token.lastIndex;
      }
      if (cursor < body.length && timed.length) timed[timed.length - 1].text += body.slice(cursor);
      if (!timed.length) return;
      timed.forEach((word, index) => {
        const next = timed[index + 1];
        word.end = next ? Math.max(word.start + 0.04, next.start) : Math.max(word.start + 0.04, lineStart + 4);
      });
      lines.push({ start: lineStart, end: timed[timed.length - 1].end, words: timed });
    });
    return normaliseLines(lines, "Musixmatch RichSync");
  }

  function parseLrclibScalar(value) {
    const text = String(value == null ? "" : value).trim();
    if (text === "''" || text === '""') return "";
    if (text.startsWith("'") && text.endsWith("'")) {
      return text.slice(1, -1).replace(/''/g, "'");
    }
    if (text.startsWith('"') && text.endsWith('"')) {
      try { return JSON.parse(text); } catch (error) { return text.slice(1, -1); }
    }
    return text;
  }

  function parseLrclibLyricsFile(text) {
    const lines = [];
    String(text || "").split(/\r?\n(?=-\s*text:)/).forEach((block) => {
      const textMatch = block.match(/(?:^|\r?\n)-\s*text:\s*(.*)$/m);
      const startMatch = block.match(/(?:^|\r?\n)\s*start_ms:\s*(-?\d+(?:\.\d+)?)\s*$/m);
      const endMatch = block.match(/(?:^|\r?\n)\s*end_ms:\s*(-?\d+(?:\.\d+)?)\s*$/m);
      if (!textMatch || !startMatch || !endMatch) return;
      const lineText = parseLrclibScalar(textMatch[1]);
      const start = Number(startMatch[1]) / 1000;
      const end = Number(endMatch[1]) / 1000;
      if (!lineText.trim() || !Number.isFinite(start) || !Number.isFinite(end)) return;
      lines.push({ start, end, words: [{ text: lineText, start, end }] });
    });
    return normaliseLines(lines, "LRCLIB lyricsfile（逐行時間）");
  }

  function parseLrclibSyncedLyrics(text) {
    const lines = [];
    String(text || "").split(/\r?\n/).forEach((rawLine) => {
      const tags = [...rawLine.matchAll(/\[(\d+):(\d{1,2}(?:\.\d+)?)\]/g)];
      if (!tags.length) return;
      const lineText = rawLine.replace(/\[\d+:\d{1,2}(?:\.\d+)?\]/g, "").trim();
      if (!lineText) return;
      tags.forEach((tag) => {
        const start = Number(tag[1]) * 60 + Number(tag[2]);
        if (Number.isFinite(start)) lines.push({ start, text: lineText });
      });
    });
    lines.sort((a, b) => a.start - b.start);
    const timed = lines.map((line, index) => {
      const next = lines[index + 1];
      const end = next ? Math.max(line.start + 0.04, next.start) : line.start + 4;
      return { start: line.start, end, words: [{ text: line.text, start: line.start, end }] };
    });
    return normaliseLines(timed, "LRCLIB syncedLyrics（逐行時間）");
  }

  function parseLrclib(payload) {
    if (!payload || typeof payload !== "object") return null;
    return parseLrclibLyricsFile(payload.lyricsfile)
      || parseLrclibSyncedLyrics(payload.syncedLyrics);
  }

  function parseTtml(text) {
    if (typeof root.DOMParser !== "function") return null;
    let doc;
    try {
      doc = new root.DOMParser().parseFromString(String(text || ""), "application/xml");
    } catch (error) {
      return null;
    }
    if (!doc || doc.querySelector("parsererror")) return null;
    const paragraphs = Array.from(doc.getElementsByTagName("p"));
    const lines = [];
    paragraphs.forEach((paragraph) => {
      const timedNodes = Array.from(paragraph.getElementsByTagName("span"))
        .filter((node) => node.hasAttribute("begin"))
        .filter((node) => !Array.from(node.children || []).some((child) => child.hasAttribute("begin")));
      const words = timedNodes.map((node, index) => ({
        text: node.textContent || "",
        start: parseTime(node.getAttribute("begin")),
        end: parseTime(node.getAttribute("end"))
          ?? (timedNodes[index + 1] ? parseTime(timedNodes[index + 1].getAttribute("begin")) : null)
      }));
      const fallbackText = paragraph.textContent || "";
      const start = parseTime(paragraph.getAttribute("begin"));
      const end = parseTime(paragraph.getAttribute("end"));
      if (words.some((word) => word.text.trim())) {
        lines.push({ start, end, words });
      } else if (fallbackText.trim() && start != null) {
        lines.push({ start, end: end ?? start + 2, words: [{ text: fallbackText, start, end: end ?? start + 2 }] });
      }
    });
    return normaliseLines(lines, "AMLL TTML DB");
  }

  function getLocalStorage() {
    try {
      return root.localStorage;
    } catch (error) {
      return null;
    }
  }

  function cacheKey(song) {
    return `${CACHE_PREFIX}${CACHE_VERSION}-${String(song && song.id || "unknown")}`;
  }

  function readCache(song) {
    const storage = getLocalStorage();
    if (!storage) return null;
    try {
      const value = JSON.parse(storage.getItem(cacheKey(song)) || "null");
      return value && value.format === "timed-lyrics-v1" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeCache(song, value) {
    const storage = getLocalStorage();
    if (!storage || !value) return;
    try {
      storage.setItem(cacheKey(song), JSON.stringify(value));
    } catch (error) {
      // A full localStorage must never disable the lyric page.
    }
  }

  function notify(options, event) {
    if (options && typeof options.onStatus === "function") {
      try { options.onStatus(event); } catch (error) { /* UI callback is optional */ }
    }
  }

  async function fetchJson(url, options) {
    const controller = typeof root.AbortController === "function" ? new root.AbortController() : null;
    const timeout = root.setTimeout(() => controller && controller.abort(), (options && options.timeoutMs) || 9000);
    try {
      const response = await root.fetch(url, {
        signal: controller ? controller.signal : undefined,
        headers: (options && options.headers) || { Accept: "application/json" }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    } finally {
      root.clearTimeout(timeout);
    }
  }

  function sourceTitle(song) {
    if (song && song.karaokeTitle) return String(song.karaokeTitle);
    const title = String(song && song.title || "");
    const matches = [...title.matchAll(/\(([^()]*)\)/g)];
    return matches.length ? matches[matches.length - 1][1] : title;
  }

  function sourceArtist(song) {
    return String(song && (song.artist || song.karaokeArtist) || "Vaundy");
  }

  function estimatedSongDuration(song) {
    const times = Array.isArray(song && song.lyrics)
      ? song.lyrics.map(line => finite(line && line.time)).filter(value => value != null)
      : [];
    return times.length ? Math.max(...times) + 5 : null;
  }

  function scoreLrclibCandidate(candidate, song, options) {
    if (!candidate || candidate.instrumental) return -Infinity;
    if (!candidate.lyricsfile && !candidate.syncedLyrics) return -Infinity;
    const wantedTitle = normaliseText(sourceTitle(song));
    const candidateTitle = normaliseText(candidate.trackName || candidate.name || "");
    const wantedArtist = normaliseText(sourceArtist(song));
    const candidateArtist = normaliseText(candidate.artistName || "");
    if (!candidateTitle || !candidateArtist) return -Infinity;

    let score = 0;
    if (candidateTitle === wantedTitle) score += 30;
    else if (candidateTitle.includes(wantedTitle) || wantedTitle.includes(candidateTitle)) score += 12;
    if (candidateArtist === wantedArtist) score += 12;
    else if (candidateArtist.includes(wantedArtist) || wantedArtist.includes(candidateArtist)) score += 8;

    const wantedDuration = finite(options && options.duration) || estimatedSongDuration(song);
    const candidateDuration = finite(candidate.duration);
    if (wantedDuration && candidateDuration) {
      const difference = Math.abs(wantedDuration - candidateDuration);
      if (difference <= 3) score += 12;
      else if (difference <= 8) score += 7;
      else if (difference <= 20) score += 2;
      else if (difference <= 30) score -= 3;
      else score -= 25;
    }
    if (candidate.lyricsfile) score += 2;
    return score;
  }

  async function fetchWorker(song, options) {
    const base = String((options && options.workerUrl) || DEFAULT_WORKER).replace(/\/$/, "");
    const trackId = encodeURIComponent(`horo-${String(song && song.id || "song")}`);
    const url = new URL(`${base}/lyrics/${trackId}`);
    url.searchParams.set("track_name", sourceTitle(song));
    url.searchParams.append("artist_name", sourceArtist(song));
    const duration = finite(options && options.duration);
    if (duration && duration > 0) url.searchParams.set("duration", String(Math.round(duration)));
    const payload = await fetchJson(url.toString(), {
      timeoutMs: (options && options.timeoutMs) || 12000,
      headers: { Accept: "application/json", Authorization: "Bearer static-site" }
    });
    const timed = normaliseBeautifulLyrics(payload);
    if (timed) {
      timed.source = "開源多來源（Musixmatch / QQ / 酷狗 / 網易雲）";
      timed.providerOrder = PROVIDER_ORDER.slice(0, 4);
    }
    return timed;
  }

  async function fetchAmll(song, options) {
    const url = new URL(`${AMLL_API}/v1/lyrics/search`);
    url.searchParams.set("musicName", sourceTitle(song));
    url.searchParams.set("artistName", sourceArtist(song));
    url.searchParams.set("pageSize", "10");
    const search = await fetchJson(url.toString(), { timeoutMs: (options && options.timeoutMs) || 7000 });
    const items = search && search.status === 200 && search.data && Array.isArray(search.data.items)
      ? search.data.items : [];
    const wantedTitle = normaliseText(sourceTitle(song));
    const wantedArtist = normaliseText(sourceArtist(song));
    const item = items.find((candidate) => {
      const titles = Array.isArray(candidate.musicNames) ? candidate.musicNames : [];
      const artists = Array.isArray(candidate.artistNames) ? candidate.artistNames : [];
      return titles.some((title) => normaliseText(title) === wantedTitle)
        && artists.some((artist) => normaliseText(artist).includes(wantedArtist) || wantedArtist.includes(normaliseText(artist)));
    }) || items[0];
    if (!item) return null;

    const lyricUrl = new URL(`${AMLL_API}/v1/lyrics/get`);
    lyricUrl.searchParams.set("id", String(item.id));
    const fetched = await fetchJson(lyricUrl.toString(), { timeoutMs: (options && options.timeoutMs) || 7000 });
    const ttml = fetched && fetched.status === 200 && fetched.data && fetched.data.lyrics;
    const timed = ttml ? parseTtml(ttml) : null;
    if (timed) timed.providerOrder = ["AMLL TTML DB"];
    return timed;
  }

  async function fetchLrclib(song, options) {
    const url = new URL(`${LRCLIB_API}/search`);
    url.searchParams.set("track_name", sourceTitle(song));
    url.searchParams.set("artist_name", sourceArtist(song));
    const search = await fetchJson(url.toString(), {
      timeoutMs: (options && options.timeoutMs) || 7000
    });
    if (!Array.isArray(search)) return null;

    const candidates = search
      .map((candidate, index) => ({ candidate, index, score: scoreLrclibCandidate(candidate, song, options) }))
      .filter(entry => Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    for (const entry of candidates) {
      const timed = parseLrclib(entry.candidate);
      if (!timed) continue;
      timed.source = timed.source || "LRCLIB lyricsfile（逐行時間）";
      timed.providerOrder = ["LRCLIB lyricsfile（逐行時間）"];
      timed.granularity = "line";
      timed.trackId = entry.candidate.id;
      return timed;
    }
    return null;
  }

  async function load(song, options) {
    if (!song || !song.id) return null;
    const opts = options || {};
    const key = cacheKey(song);
    if (pending.has(key)) return pending.get(key);

    const cached = readCache(song);
    if (cached) {
      notify(opts, { state: "cache", source: cached.source });
      return cached;
    }
    if (root.navigator && root.navigator.onLine === false) {
      notify(opts, { state: "offline" });
      return null;
    }

    const request = (async () => {
      notify(opts, { state: "loading", source: PROVIDER_ORDER.slice(0, 4).join(" → ") });
      let timed = await fetchWorker(song, opts);
      if (!timed) {
        notify(opts, { state: "fallback", source: "AMLL TTML DB" });
        timed = await fetchAmll(song, opts);
      }
      if (!timed) {
        notify(opts, { state: "fallback", source: "LRCLIB lyricsfile（逐行時間）" });
        timed = await fetchLrclib(song, opts);
      }
      if (timed) {
        writeCache(song, timed);
        notify(opts, { state: "ready", source: timed.source });
      } else {
        notify(opts, { state: "miss" });
      }
      return timed;
    })();
    pending.set(key, request);
    try {
      return await request;
    } finally {
      pending.delete(key);
    }
  }

  function flattenWords(lines) {
    const words = [];
    (lines || []).forEach((line) => (line.words || []).forEach((word) => {
      words.push({ ...word, sourceWord: words.length });
    }));
    return words;
  }

  function median(values) {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return 0;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  /* Match provider text to the hand-edited line list, then translate the
     provider's audio clock into the YouTube video's clock. */
  function alignToLocalLyrics(timedLyrics, localLyrics) {
    if (!timedLyrics || !Array.isArray(timedLyrics.lines) || !Array.isArray(localLyrics)) return null;
    const words = flattenWords(timedLyrics.lines);
    const chars = [];
    words.forEach((word, wordIndex) => {
      Array.from(normaliseText(word.text)).forEach((char) => {
        chars.push({ char, wordIndex, start: word.start, end: word.end });
      });
    });
    const sourceText = chars.map((entry) => entry.char).join("");
    if (!sourceText) return null;

    const matches = [];
    let cursor = 0;
    localLyrics.forEach((line, index) => {
      const text = normaliseText(line && line.jp);
      if (text.length < 2) return;
      let position = sourceText.indexOf(text, cursor);
      if (position < 0) position = sourceText.indexOf(text);
      if (position < 0) return;
      const first = chars[position];
      const last = chars[position + text.length - 1];
      if (!first || !last) return;
      const localStart = finite(line.time);
      if (localStart == null) return;
      const firstWord = first.wordIndex;
      const lastWord = last.wordIndex;
      const matchedWords = words.slice(firstWord, lastWord + 1);
      if (!matchedWords.length) return;
      matches.push({
        index,
        position,
        start: first.start,
        end: Math.max(first.start + 0.04, last.end),
        localStart,
        words: matchedWords
      });
      cursor = position + text.length;
    });

    const eligible = localLyrics.filter((line) => normaliseText(line && line.jp).length >= 2).length;
    const minimum = Math.min(3, Math.max(1, eligible));
    if (matches.length < minimum) return null;
    if (eligible >= 6 && matches.length / eligible < 0.18) return null;

    /* Keep the existing hand-edited line anchors authoritative.  Providers
       often use a different intro trim or combine/split lines, so applying
       one global offset to every word can make the first line visibly late.
       We still expose the robust median offset for diagnostics, while each
       matched line keeps its local anchor and preserves the provider's
       relative word rhythm inside that line. */
    const offset = median(matches.map((match) => match.localStart - match.start));
    const aligned = Array(localLyrics.length).fill(null);
    matches.forEach((match) => {
      const lineOffset = match.localStart - match.start;
      const wordsWithOffset = match.words.map((word) => ({
        text: word.text,
        start: Math.max(0, word.start + lineOffset),
        end: Math.max(word.start + lineOffset + 0.04, word.end + lineOffset)
      }));
      aligned[match.index] = {
        start: Math.max(0, match.localStart),
        end: Math.max(match.localStart + 0.04, match.end + lineOffset),
        words: wordsWithOffset
      };
    });
    return {
      format: "timed-lyrics-v1-aligned",
      songId: null,
      source: timedLyrics.source,
      providerOrder: timedLyrics.providerOrder || PROVIDER_ORDER.slice(),
      offset,
      matchedLines: matches.length,
      totalLines: eligible,
      lines: aligned
    };
  }

  /* Map the displayed units (Japanese, ruby-wrapped kana, or romaji words)
     to provider words.  Romaji cannot be text-matched to Japanese, so the
     caller can use the returned match count to choose a proportional fallback. */
  function mapUnitsToWords(unitTexts, words) {
    const chars = [];
    (words || []).forEach((word, wordIndex) => {
      Array.from(normaliseText(word.text)).forEach((char) => chars.push({ char, wordIndex, word }));
    });
    const text = chars.map((entry) => entry.char).join("");
    const out = [];
    let cursor = 0;
    let matched = 0;
    (unitTexts || []).forEach((unitText) => {
      const wanted = normaliseText(unitText);
      if (!wanted) {
        out.push(null);
        return;
      }
      let position = text.indexOf(wanted, cursor);
      if (position < 0) position = text.indexOf(wanted);
      if (position < 0) {
        out.push(null);
        return;
      }
      const first = chars[position];
      const last = chars[position + wanted.length - 1];
      out.push({
        start: first.word.start,
        end: Math.max(first.word.start + 0.04, last.word.end)
      });
      cursor = position + wanted.length;
      matched += 1;
    });
    return { timings: out, matched, total: (unitTexts || []).filter((textValue) => normaliseText(textValue)).length };
  }

  function allocateUnitTimings(unitTexts, start, end) {
    const total = Math.max(0.04, end - start);
    const weights = (unitTexts || []).map((text) => Math.max(0.45, normaliseText(text).length || 1));
    const weightSum = weights.reduce((sum, value) => sum + value, 0) || 1;
    let cursor = start;
    return weights.map((weight) => {
      const next = cursor + total * weight / weightSum;
      const result = { start: cursor, end: Math.max(cursor + 0.02, next) };
      cursor = next;
      return result;
    });
  }

  root.KARAOKE_SOURCES = Object.freeze({
    CACHE_VERSION,
    DEFAULT_WORKER,
    LRCLIB_API,
    PROVIDER_ORDER,
    normaliseText,
    parseEnhancedLrc,
    parseLrclib,
    parseLrclibLyricsFile,
    parseLrclibSyncedLyrics,
    parseTtml,
    normaliseBeautifulLyrics,
    load,
    alignToLocalLyrics,
    mapUnitsToWords,
    allocateUnitTimings
  });
})(typeof window !== "undefined" ? window : globalThis);
