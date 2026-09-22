const app = document.getElementById("app");

function isGuideRoute(){
  return location.hash.replace(/^#\/?/, "") === "guide";
}

function loadAppStyles(){
  const link = document.querySelector("link[data-app-styles]");
  if (!link || !link.disabled) return Promise.resolve();
  return new Promise(resolve => {
    const done = () => {
      link.removeEventListener("load", done);
      link.removeEventListener("error", done);
      resolve();
    };
    link.addEventListener("load", done, { once: true });
    link.addEventListener("error", done, { once: true });
    link.disabled = false;
    link.removeAttribute("disabled");
    if (link.sheet) done();
  });
}

if (!isGuideRoute()){
  app.innerHTML = "";
  app.hidden = true;
  Promise.all([loadAppStyles(), import("./main.js")]).then(()=>{ app.hidden = false; });
} else {
  const pending = {
    hash: "",
    search: "",
    sort: "",
    openChangelog: false,
    toggleTheme: false,
    scrollY: 0
  };
  let mainPromise = null;
  let cleaned = false;

  const remember = event => {
    const target = event?.target;
    if (target?.closest?.(".song-row")) pending.hash = `#/song/${target.closest(".song-row").dataset.id}`;
    if (target?.closest?.("#back-btn")) pending.hash = "#/";
    if (target?.closest?.("[data-sort]")) pending.sort = target.closest("[data-sort]").dataset.sort;
    if (target?.closest?.("[data-open-changelog]")) pending.openChangelog = true;
    if (target?.closest?.("[data-theme-toggle]")) pending.toggleTheme = true;
    if (target?.matches?.("#song-search-input")) pending.search = target.value;
    if (event?.type === "scroll") pending.scrollY = window.scrollY;
  };

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    window.removeEventListener("pointerdown", onInteraction, true);
    window.removeEventListener("keydown", onInteraction, true);
    window.removeEventListener("touchstart", onInteraction, true);
    window.removeEventListener("scroll", onInteraction, { capture: true });
    window.removeEventListener("hashchange", onInteraction, true);
    document.removeEventListener("input", onInteraction, true);
  };

  const finishInteraction = () => {
    cleanup();
    requestAnimationFrame(()=>{
      if (pending.toggleTheme){
        document.querySelector("[data-theme-toggle]")?.click();
        pending.toggleTheme = false;
      }
      const input = document.getElementById("song-search-input");
      if (input && pending.search){
        input.value = pending.search;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (pending.sort){
        document.querySelector(`[data-sort="${pending.sort}"]`)?.click();
        pending.sort = "";
      }
      if (pending.openChangelog){
        document.querySelector("[data-open-changelog]")?.click();
        pending.openChangelog = false;
      }
      if (pending.hash){
        location.hash = pending.hash;
        pending.hash = "";
      }
      if (pending.scrollY) window.scrollTo(0, pending.scrollY);
    });
  };

  const onInteraction = event => {
    remember(event);
    if (!mainPromise){
      mainPromise = Promise.all([loadAppStyles(), import("./main.js")]).then(finishInteraction);
    }
  };

  window.addEventListener("pointerdown", onInteraction, true);
  window.addEventListener("keydown", onInteraction, true);
  window.addEventListener("touchstart", onInteraction, true);
  window.addEventListener("scroll", onInteraction, { passive: true, capture: true });
  window.addEventListener("hashchange", onInteraction, true);
  document.addEventListener("input", onInteraction, true);
}
