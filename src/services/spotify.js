/*
 * Spotify Web Playback SDK 音源。
 *
 * 需要 Spotify Premium，並只支援桌面瀏覽器。登入使用 Authorization Code
 * + PKCE，不需要 client secret；Client ID 由建置環境變數
 * VITE_SPOTIFY_CLIENT_ID 提供，沒有設定時整個 Spotify 音源不會出現。
 *
 * createSpotifyPlayer() 回傳的物件刻意模仿 YouTube IFrame Player 的方法
 * （getCurrentTime、seekTo、loadVideoById…），讓歌詞同步、只聽大合唱與
 * PiP 等既有邏輯不需要知道目前是哪一種音源。所有對外的秒數都已換算成
 * YouTube 影片時間軸：影片秒數 = Spotify 秒數 + offset。
 */
import { store } from "./storage.js";

const CLIENT_ID = import.meta.env?.VITE_SPOTIFY_CLIENT_ID || "";
const SCOPES = "streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state";
const TOKEN_KEY = "horo-spotify-token";
const LOGIN_KEY = "horo-spotify-login";
const SDK_URL = "https://sdk.scdn.co/spotify-player.js";
const API = "https://api.spotify.com/v1";

const STATE = Object.freeze({ ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 });

export function spotifyConfigured(){
  return Boolean(CLIENT_ID);
}

function redirectUri(){
  return `${location.origin}${location.pathname}`;
}

function randomString(length){
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, byte => chars[byte % chars.length]).join("");
}

async function codeChallenge(verifier){
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function readToken(){
  try { return JSON.parse(store(TOKEN_KEY) || "null"); } catch(e){ return null; }
}

function saveToken(payload, previous){
  const token = {
    access: payload.access_token,
    refresh: payload.refresh_token || (previous && previous.refresh) || "",
    expiresAt: Date.now() + (Number(payload.expires_in) || 3600) * 1000
  };
  store(TOKEN_KEY, JSON.stringify(token));
  return token;
}

export function hasSpotifySession(){
  const token = readToken();
  return Boolean(token && (token.refresh || token.expiresAt > Date.now()));
}

export function clearSpotifySession(){
  try { localStorage.removeItem(TOKEN_KEY); } catch(e){}
}

/* 轉往 Spotify 登入頁；回來時由 completeSpotifyLogin() 換成 token，
   並回到原本的頁面（Spotify 會丟掉網址的 #hash，所以先記在 session）。 */
export async function beginSpotifyLogin(returnHash){
  const verifier = randomString(64);
  const state = randomString(16);
  try {
    sessionStorage.setItem(LOGIN_KEY, JSON.stringify({ verifier, state, returnHash: returnHash || "" }));
  } catch(e){ return; }
  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: redirectUri(),
    state,
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier)
  }).toString();
  location.assign(url.toString());
}

/* 網址帶有 Spotify 回傳的 ?code= 時完成登入。沒有登入流程時回傳 null。 */
export async function completeSpotifyLogin(){
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const error = params.get("error");
  if (!code && !error) return null;

  let pending = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(LOGIN_KEY) || "null");
    sessionStorage.removeItem(LOGIN_KEY);
  } catch(e){}
  if (!pending || params.get("state") !== pending.state) return null;

  history.replaceState(null, "", `${location.pathname}${pending.returnHash || ""}`);
  if (error) return { ok: false, error, returnHash: pending.returnHash };

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(),
        client_id: CLIENT_ID,
        code_verifier: pending.verifier
      })
    });
    if (!response.ok) return { ok: false, error: `token_${response.status}`, returnHash: pending.returnHash };
    saveToken(await response.json());
    return { ok: true, returnHash: pending.returnHash };
  } catch(e){
    return { ok: false, error: "network", returnHash: pending.returnHash };
  }
}

let refreshing = null;
async function getAccessToken(){
  const token = readToken();
  if (!token) return null;
  if (token.expiresAt - 60000 > Date.now()) return token.access;
  if (!token.refresh) return null;
  if (!refreshing){
    refreshing = fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refresh,
        client_id: CLIENT_ID
      })
    })
      .then(async response => {
        if (!response.ok){
          if (response.status === 400 || response.status === 401) clearSpotifySession();
          return null;
        }
        return saveToken(await response.json(), token).access;
      })
      .catch(() => null)
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

let sdkPromise = null;
function loadSdk(){
  if (window.Spotify && window.Spotify.Player) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("sdk_timeout")), 15000);
    window.onSpotifyWebPlaybackSDKReady = () => { clearTimeout(timer); resolve(); };
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onerror = () => { clearTimeout(timer); reject(new Error("sdk_load")); };
    document.head.appendChild(script);
  });
  sdkPromise.catch(() => { sdkPromise = null; });
  return sdkPromise;
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/*
 * options:
 *   resolveTrack(youtubeId) → { id, offset } | null
 *   onReady()               裝置已連上，可以開始播放
 *   onStateChange({ data }) data 使用 YouTube 的狀態碼（0 結束、1 播放、2 暫停、3 緩衝）
 *   onTrack(track)          目前曲目資訊（歌名、封面）更新
 *   onError(message, kind)  kind: "auth" 需要重新登入，其餘為一般錯誤
 */
export function createSpotifyPlayer(options){
  let sdk = null;
  let deviceId = null;
  let ready = false;
  let track = null;             // { id, offset, youtubeId }
  let loadedOnDevice = false;   // 目前曲目是否已送到這個播放裝置
  let snap = { position: 0, duration: 0, paused: true, loading: false, at: performance.now() };
  let stateCode = -1;
  let volume = 100;
  let muted = false;
  let pollTimer = null;
  let pendingSeek = null;       // 送出 seek 後，SDK 回報新位置前先沿用目標位置

  const adapter = {
    isReady: () => ready,
    trackUrl: () => track ? `https://open.spotify.com/track/${track.id}` : "",

    getCurrentTime(){
      if (!track) return 0;
      const moving = !snap.paused && !snap.loading;
      let position = snap.position + (moving ? (performance.now() - snap.at) / 1000 : 0);
      if (snap.duration) position = Math.min(position, snap.duration);
      return position + track.offset;
    },
    getDuration(){
      return track && snap.duration ? snap.duration + track.offset : 0;
    },
    getPlayerState: () => stateCode,

    playVideo(){
      if (!sdk || !track) return;
      activate();
      if (!loadedOnDevice){ if (!track.request) start(track, snap.position); }
      else sdk.resume().catch(() => {});
    },
    pauseVideo(){
      if (sdk && loadedOnDevice) sdk.pause().catch(() => {});
    },
    seekTo(videoSeconds){
      if (!track) return;
      const seconds = Math.max(0, Number(videoSeconds) - track.offset);
      setSnap({ position: seconds, at: performance.now() });
      pendingSeek = { seconds, until: performance.now() + 2000 };
      if (!loadedOnDevice){ start(track, seconds); return; }
      sdk.seek(Math.round(seconds * 1000)).catch(() => {});
    },
    loadVideoById(request){
      const youtubeId = typeof request === "string" ? request : request && request.videoId;
      const startVideoSeconds = typeof request === "object" && request ? Number(request.startSeconds) || 0 : 0;
      const resolved = options.resolveTrack(youtubeId);
      if (!resolved){
        track = null;
        options.onError("這首歌沒有對應的 Spotify 音軌。", "track");
        return;
      }
      track = { ...resolved, youtubeId };
      loadedOnDevice = false;
      setSnap({ position: Math.max(0, startVideoSeconds - track.offset), duration: 0, paused: true, at: performance.now() });
      activate();
      start(track, snap.position);
    },

    getVolume: () => volume,
    isMuted: () => muted,
    setVolume(value){
      volume = Math.max(0, Math.min(100, Number(value) || 0));
      applyVolume();
    },
    mute(){ muted = true; applyVolume(); },
    unMute(){ muted = false; applyVolume(); },

    getAvailablePlaybackRates: () => [1],
    setPlaybackRate(){},

    destroy(){
      stopPolling();
      if (sdk) sdk.disconnect();
      sdk = null;
      ready = false;
    }
  };

  function activate(){
    // 瀏覽器的自動播放限制：在使用者操作當下喚醒 SDK 的音訊元素。
    try { if (sdk && typeof sdk.activateElement === "function") sdk.activateElement(); } catch(e){}
  }

  function applyVolume(){
    if (sdk) sdk.setVolume(muted ? 0 : volume / 100).catch(() => {});
  }

  function setSnap(next){
    snap = { ...snap, ...next };
  }

  function emit(code){
    if (code === stateCode && code !== STATE.ENDED) return;
    stateCode = code;
    options.onStateChange({ data: code, target: adapter });
  }

  async function start(target, seconds){
    if (!deviceId) return;
    const request = { seconds };
    target.request = request;             // 同一首連續要求時，只有最後一次有效
    target.seen = false;
    target.ended = false;
    try {
      await sendPlay(target, request);
    } finally {
      if (target.request === request) target.request = null;
    }
  }

  async function sendPlay(target, request){
    const stale = () => track !== target || target.request !== request;   // 等待中已經換歌或重新要求
    const body = JSON.stringify({
      uris: [`spotify:track:${target.id}`],
      position_ms: Math.max(0, Math.round(request.seconds * 1000))
    });
    for (let attempt = 0; attempt < 3; attempt++){
      const token = await getAccessToken();
      if (stale()) return;
      if (!token){ options.onError("Spotify 登入已過期，請重新登入。", "auth"); return; }
      let response = null;
      try {
        response = await fetch(`${API}/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body
        });
      } catch(e){}
      if (stale()) return;
      if (response && response.ok){
        loadedOnDevice = true;
        applyVolume();
        return;
      }
      const status = response ? response.status : 0;
      if (status === 401){ clearSpotifySession(); options.onError("Spotify 登入已過期，請重新登入。", "auth"); return; }
      if (status === 403){ options.onError("Spotify 拒絕播放；網頁播放需要 Premium 帳號。", "account"); return; }
      // 剛連上的裝置有時要等一下才會出現在 Spotify 的裝置清單（404）。
      await wait(800 * (attempt + 1));
      if (stale()) return;
    }
    options.onError("無法在這個瀏覽器啟動 Spotify 播放，請稍後再試。", "playback");
  }

  function handleState(state){
    if (!state){
      // 其他裝置接手播放後，這個播放器就不再有狀態。
      loadedOnDevice = false;
      setSnap({ paused: true, at: performance.now() });
      emit(STATE.PAUSED);
      return;
    }
    if (!track) return;
    const current = state.track_window && state.track_window.current_track;
    const previous = state.track_window && state.track_window.previous_tracks || [];
    const isOurs = item => Boolean(item && (item.id === track.id
      || (item.linked_from && item.linked_from.id === track.id)));
    if (!track.seen){
      // 換歌後，上一首的狀態通知可能晚到；確認輪到這首之前一律忽略。
      if (!isOurs(current)) return;
      track.seen = true;
    }
    if (track.ended) return;
    const position = state.position / 1000;
    const wasPlaying = !snap.paused;
    const playedToEnd = state.paused && position === 0 && wasPlaying
      && (previous.some(isOurs) || snap.duration - snap.position < 2);
    const switchedAway = Boolean(current && current.id) && !isOurs(current);

    if (pendingSeek && performance.now() < pendingSeek.until && Math.abs(position - pendingSeek.seconds) > 1.5){
      // SDK 還在回報 seek 前的位置，暫時不要覆蓋目標位置。
      setSnap({ paused: state.paused, loading: state.loading, duration: state.duration / 1000 });
    } else {
      pendingSeek = null;
      setSnap({
        position,
        duration: state.duration / 1000,
        paused: state.paused,
        loading: state.loading,
        at: performance.now()
      });
    }

    if (current && options.onTrack) options.onTrack(current);

    if (playedToEnd || switchedAway){
      if (switchedAway && sdk) sdk.pause().catch(() => {});
      track.ended = true;
      loadedOnDevice = false;
      stopPolling();
      emit(STATE.ENDED);
      return;
    }
    if (state.loading) emit(STATE.BUFFERING);
    else if (state.paused){ stopPolling(); emit(STATE.PAUSED); }
    else { startPolling(); emit(STATE.PLAYING); }
  }

  /* SDK 只在狀態改變時通知；播放中每秒讀一次實際位置，修正內插誤差。 */
  function startPolling(){
    if (pollTimer) return;
    pollTimer = setInterval(() => {
      if (!sdk) return;
      sdk.getCurrentState().then(state => { if (state) handleState(state); }).catch(() => {});
    }, 1000);
  }
  function stopPolling(){
    if (pollTimer){ clearInterval(pollTimer); pollTimer = null; }
  }

  loadSdk().then(() => {
    sdk = new window.Spotify.Player({
      name: options.name || "Web Player",
      getOAuthToken: callback => {
        getAccessToken().then(token => {
          if (token) callback(token);
          else options.onError("Spotify 登入已過期，請重新登入。", "auth");
        });
      },
      volume: volume / 100
    });
    sdk.addListener("ready", ({ device_id }) => {
      deviceId = device_id;
      ready = true;
      options.onReady();
    });
    sdk.addListener("not_ready", () => {
      ready = false;
      loadedOnDevice = false;
    });
    sdk.addListener("player_state_changed", handleState);
    sdk.addListener("initialization_error", () =>
      options.onError("這個瀏覽器無法使用 Spotify 網頁播放（手機瀏覽器不支援），請改用 YouTube。", "browser"));
    sdk.addListener("authentication_error", () => {
      clearSpotifySession();
      options.onError("Spotify 登入已過期，請重新登入。", "auth");
    });
    sdk.addListener("account_error", () =>
      options.onError("Spotify 網頁播放需要 Premium 帳號。", "account"));
    sdk.addListener("playback_error", () =>
      options.onError("Spotify 播放發生錯誤，請重新選擇歌曲。", "playback"));
    return sdk.connect();
  }).then(connected => {
    if (connected === false) options.onError("無法連線到 Spotify，請稍後再試。", "playback");
  }).catch(() => {
    options.onError("無法載入 Spotify 播放元件，請檢查網路連線。", "playback");
  });

  return adapter;
}
