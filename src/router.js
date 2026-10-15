import { gsap } from "gsap";
import { motion, clampScroll } from "./motion.js";
import { carryVisual } from "./shared-visual.js";
import { prepareShowcase, showcaseDestination } from "./showcase.js";

const routes = new Set([
  "index.html",
  "axion.html",
  "bug-brain-chess.html",
  "snake.html",
  "3d_portfolio.html",
  "",
]);
const pagePath = (url) => url.pathname.replace(/index\.html$/, "");
const findStage = (main, id) =>
  main.dataset.case === id
    ? main.querySelector(".case-main-visual")
    : main.querySelector(`[data-showcase="${id}"] .project-stage`);

// Cancel preparation immediately when newer navigation supersedes it; the shared
// fetch may still populate the cache, but cannot mutate the mounted document.
function waitForPreparation(promise, signal) {
  return new Promise((resolve, reject) => {
    const abort = () =>
      reject(new DOMException("Navigation superseded", "AbortError"));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", abort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", abort);
        reject(error);
      },
    );
  });
}

export function createRouter({ system, mount, unmount, reduced, closeMenu }) {
  let busy = false,
    pending = null,
    saveTimer,
    activeTimeline = null,
    preparing = null,
    navigatingTo = null;
  let renderedURL = new URL(location.href);
  const cache = new Map(),
    homePositions = new Map();
  const audit = new URLSearchParams(location.search).has("motion-audit");
  history.scrollRestoration = "manual";
  function remember() {
    if (location.href === renderedURL.href)
      history.replaceState(
        { ...history.state, scroll: [scrollX, scrollY] },
        "",
        location.href,
      );
  }
  remember();
  addEventListener(
    "scroll",
    () => {
      clearTimeout(saveTimer);
      if (!busy) saveTimer = setTimeout(remember, 120);
    },
    { passive: true },
  );
  function fetchPage(url) {
    if (!cache.has(url.pathname)) {
      cache.set(
        url.pathname,
        fetch(url.href)
          .then(async (response) => {
            if (!response.ok) throw new Error("Page unavailable");
            const doc = new DOMParser().parseFromString(
              await response.text(),
              "text/html",
            );
            if (!doc.querySelector("main"))
              throw new Error("Page content missing");
            return doc;
          })
          .catch((error) => {
            cache.delete(url.pathname);
            throw error;
          }),
      );
    }
    return cache.get(url.pathname);
  }
  const eligible = (a) => {
    if (!a || a.download || a.target === "_blank") return null;
    const url = new URL(a.href);
    return url.origin === location.origin &&
      routes.has(url.pathname.split("/").pop())
      ? url
      : null;
  };
  function prefetch(e) {
    const url = eligible(e.target.closest("a[href]"));
    if (url && pagePath(url) !== pagePath(renderedURL))
      fetchPage(url).catch(() => {});
  }
  document.addEventListener("pointerover", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);
  document.addEventListener("touchstart", prefetch, { passive: true });

  async function navigate(url, { pop = false, scroll = null } = {}) {
    if (busy) {
      if (!pop && url.href === navigatingTo && !pending) return;
      pending = { url, pop, scroll };
      preparing?.abort();
      return;
    }
    closeMenu(true);
    if (pagePath(url) === pagePath(renderedURL)) {
      if (!pop) {
        remember();
        history.pushState({}, "", url);
      }
      renderedURL = url;
      const target =
        url.hash &&
        document.getElementById(decodeURIComponent(url.hash.slice(1)));
      window.scrollTo({
        top:
          scroll?.[1] ??
          (target ? target.getBoundingClientRect().top + scrollY : 0),
        behavior: reduced() || pop ? "instant" : "smooth",
      });
      return;
    }
    // Finish any index-driven native scroll at the chosen project's pose.
    window.scrollTo({ top: scrollY, behavior: "instant" });
    busy = true;
    navigatingTo = url.href;
    preparing = new AbortController();
    const signal = preparing.signal;
    clearTimeout(saveTimer);
    if (!pop) remember();
    document.body.setAttribute("aria-busy", "true");
    document.body.classList.add("route-pending");
    let preparation, outgoing, shared, oldMain;
    try {
      const doc = await waitForPreparation(fetchPage(url), signal);
      const incoming = doc.querySelector("main").cloneNode(true);
      prepareShowcase(incoming, reduced());
      preparation = document.createElement("div");
      preparation.className = "route-preparation";
      preparation.inert = true;
      preparation.append(incoming);
      document.body.append(preparation);
      await waitForPreparation(document.fonts.ready, signal);
      // Decode before the first animated frame. Never await network midway through a shot.
      await waitForPreparation(
        Promise.all(
          [
            ...incoming.querySelectorAll(
              ".case-main-visual img, .project-stage img",
            ),
          ]
            .map(async (img) => {
              img.loading = "eager";
              try {
                await img.decode();
              } catch {
                /* Native image fallback remains available. */
              }
            })
            .concat(
              [
                ...incoming.querySelectorAll(
                  ".case-main-visual video[poster], .project-stage video[poster]",
                ),
              ].map(async (video) => {
                const poster = new Image();
                poster.src = video.poster;
                try {
                  await poster.decode();
                } catch {
                  /* Native fallback. */
                }
              }),
            ),
        ),
        signal,
      );
      if (pending) return;
      preparing = null;
      oldMain = document.querySelector("main");
      const oldScroll = scrollY;
      // A fixed outgoing wrapper has no document scroll. Preserve the visible
      // sticky chapter offset before changing its containing block.
      const stickies = [
        ...oldMain.querySelectorAll(".engine-sticky, .reel-ready .reel-sticky"),
      ].map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const sharedId = incoming.dataset.case || oldMain.dataset.case;
      if (!oldMain.dataset.case && sharedId) {
        const stageRect = findStage(oldMain, sharedId)?.getBoundingClientRect();
        homePositions.set(sharedId, {
          scroll: oldScroll,
          width: innerWidth,
          height: innerHeight,
          reduced: reduced(),
          showcasePosition:
            oldMain.querySelector(".reel-ready")?.dataset.position,
          // Preserve the visual's viewport position when responsive reflow
          // makes the old absolute scroll offset point at a different section.
          stageTop:
            stageRect && stageRect.bottom > 0 && stageRect.top < innerHeight
              ? stageRect.top / innerHeight
              : 0.25,
        });
      }
      let targetY = scroll?.[1];
      if (!incoming.dataset.case && url.hash === "#projects") {
        const saved = homePositions.get(sharedId);
        const reflowed =
          saved &&
          (saved.width !== innerWidth ||
            saved.height !== innerHeight ||
            saved.reduced !== reduced());
        if (reflowed) {
          const stage = findStage(incoming, sharedId);
          const reelTarget = showcaseDestination(
            incoming,
            sharedId,
            saved.showcasePosition == null
              ? undefined
              : Number(saved.showcasePosition),
          );
          if (reelTarget != null) targetY = reelTarget;
          else if (stage)
            targetY =
              stage.getBoundingClientRect().top - saved.stageTop * innerHeight;
        } else if (targetY == null) targetY = saved?.scroll;
        if (targetY == null) targetY = showcaseDestination(incoming, sharedId);
      }
      if (targetY == null) {
        const anchor =
          url.hash &&
          incoming.querySelector(
            `#${CSS.escape(decodeURIComponent(url.hash.slice(1)))}`,
          );
        targetY = anchor ? anchor.getBoundingClientRect().top : 0;
      }
      if (!reduced() && sharedId && findStage(incoming, sharedId))
        shared = carryVisual(findStage(oldMain, sharedId));
      system()?.holdRoute();
      unmount();
      oldMain.replaceWith(incoming);
      preparation.remove();
      preparation = null;
      document.body.dataset.project = doc.body.dataset.project || "";
      if (!pop) history.pushState({ scroll: [0, targetY] }, "", url);
      renderedURL = url;
      document.title = doc.title;
      for (const selector of [
        'meta[name="description"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
      ]) {
        document
          .querySelector(selector)
          ?.setAttribute("content", doc.querySelector(selector)?.content || "");
      }
      window.scrollTo({
        top: clampScroll(
          targetY,
          document.documentElement.scrollHeight,
          innerHeight,
        ),
        behavior: "instant",
      });
      mount();
      system()?.bindPage();
      document.body.classList.remove("route-pending");
      document.body.classList.add("routing");
      incoming.inert = true;
      outgoing = document.createElement("div");
      outgoing.className = "route-outgoing";
      outgoing.inert = true;
      outgoing.setAttribute("aria-hidden", "true");
      oldMain.removeAttribute("id");
      oldMain.style.transform = `translateY(${-oldScroll}px)`;
      outgoing.append(oldMain);
      document.body.append(outgoing);
      stickies.forEach(({ element, rect }) => {
        element.style.position = "relative";
        element.style.top = "0px";
        const natural = element.getBoundingClientRect();
        element.style.top = `${rect.top - natural.top}px`;
      });
      const dest = sharedId && findStage(incoming, sharedId);
      const duration = reduced() ? 0 : motion.route;
      const timeline = gsap.timeline({
        paused: true,
        defaults: { duration, ease: motion.travel },
      });
      activeTimeline = timeline;
      timeline.to(outgoing, { clipPath: "inset(0 0 100% 0)" }, 0);
      if (shared && dest)
        shared.animate(timeline, dest, duration, motion.travel);
      system()?.joinRoute(timeline, duration);
      let previous = performance.now();
      const frames = [];
      if (audit)
        timeline.eventCallback("onUpdate", () => {
          const now = performance.now();
          frames.push(now - previous);
          previous = now;
        });
      await timeline.play();
      const startError = shared?.startErrorPx;
      const endpointError = shared?.finish();
      shared = null;
      system()?.finishRoute();
      outgoing.remove();
      outgoing = null;
      incoming.inert = false;
      document.body.classList.remove("routing");
      incoming.focus({ preventScroll: true });
      if (!pending) remember();
      if (audit) {
        const sorted = frames.slice(1).sort((a, b) => a - b);
        document.body.dataset.motionAudit = JSON.stringify({
          route: url.pathname,
          frames: sorted.length,
          medianMs: sorted[Math.floor(sorted.length / 2)] ?? 0,
          p95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
          maxMs: Math.max(0, ...sorted),
          startErrorPx: startError ?? null,
          endpointErrorPx: endpointError ?? null,
          intervals: frames.slice(1),
        });
      }
    } catch (error) {
      if (error.name !== "AbortError")
        console.warn(
          "Enhanced navigation failed; using the original page URL.",
          error,
        );
      if (!pending) location.assign(url.href);
    } finally {
      activeTimeline = null;
      preparing = null;
      navigatingTo = null;
      preparation?.remove();
      outgoing?.remove();
      shared?.discard();
      system()?.finishRoute();
      document.querySelector("main").inert = false;
      document.body.removeAttribute("aria-busy");
      document.body.classList.remove("routing", "route-pending");
      busy = false;
      if (pending) {
        const next = pending;
        pending = null;
        navigate(next.url, next);
      }
    }
  }
  // Resizing invalidates measured geometry: settle in the responsive layout before paint.
  addEventListener("resize", () => activeTimeline?.progress(1));
  addEventListener("motionchange", () => {
    if (reduced()) activeTimeline?.progress(1);
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]"),
      url = eligible(a);
    if (
      !url ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      a.classList.contains("skip-link")
    )
      return;
    e.preventDefault();
    navigate(url);
  });
  addEventListener("popstate", (e) =>
    navigate(new URL(location.href), {
      pop: true,
      scroll: e.state?.scroll || [0, 0],
    }),
  );
  return { navigate };
}
