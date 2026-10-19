// One deterministic scroll coordinate owns media, copy, colour and index.
// No scroll interception, snapping or independently chasing tween timelines.
export const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const smooth = (t) => t * t * (3 - 2 * t);
export function showcasePosition(raw, count) {
  const p = clamp(raw, 0, count - 1),
    base = Math.floor(p);
  return base + smooth(p - base);
}
// A vertical page succession, not an orbit: translation is linear in the
// presentation coordinate. Small, independent folds never invert a surface.
export function showcasePose(position, index, height = 400, mobile = false) {
  const distance = clamp(index - position, -1, 1);
  const departing = distance < 0;
  const travel = Math.abs(distance);
  // Text hands off in sequence, before the incoming project becomes active.
  // Whole headings translate a few pixels; no glyph is sliced by a slot mask.
  const text = departing
    ? 1 - smooth(clamp(travel / 0.42))
    : smooth(clamp((1 - travel - 0.52) / 0.48));
  return {
    visible: Math.abs(index - position) < 1,
    y: distance * (height + 32),
    z: -height * 0.12 * travel,
    rotate: -distance * (departing ? (mobile ? 8 : 14) : mobile ? 4 : 8),
    scale: 1 - travel * 0.015,
    textOpacity: text,
    textY: distance * (mobile ? 16 : 24),
  };
}
export function showcaseLayout(count, width, height) {
  const top = width <= 600 ? 64 : 74;
  // The sticky stage fills the available viewport. A capped height exposes the
  // next section before the final transition completes on tall screens.
  const stage = height - top;
  const step = Math.max(420, Math.min(height * 0.88, 900));
  return { top, stage, step, total: stage + step * (count - 1) };
}
export function prepareShowcase(main, reduced) {
  const reel = main.querySelector("[data-project-reel]");
  if (!reel) return null;
  const count = reel.querySelectorAll("[data-showcase]").length;
  const layout = showcaseLayout(count, innerWidth, innerHeight);
  const enabled = !reduced && innerHeight >= (innerWidth <= 600 ? 650 : 560);
  reel.classList.add("reel-mounted");
  reel.classList.toggle("reel-ready", enabled);
  reel.style.setProperty("--reel-top", `${layout.top}px`);
  reel.style.setProperty("--reel-height", `${layout.stage}px`);
  reel.style.height = enabled ? `${layout.total}px` : "";
  return { reel, count, ...layout, enabled };
}
// In the router's fixed preparation wrapper, top is already a document offset.
export function showcaseDestination(main, id, raw) {
  const reel = main.querySelector(".project-reel.reel-ready");
  if (!reel) return null;
  const panels = [...reel.querySelectorAll("[data-showcase]")];
  const index = panels.findIndex((panel) => panel.dataset.showcase === id);
  if (index < 0) return null;
  const layout = showcaseLayout(panels.length, innerWidth, innerHeight);
  return (
    reel.getBoundingClientRect().top - layout.top + (raw ?? index) * layout.step
  );
}

export function mountShowcase(main, reduced) {
  const reel = main.querySelector("[data-project-reel]");
  if (!reel) return () => {};
  const panels = [...reel.querySelectorAll("[data-showcase]")];
  const buttons = [...reel.querySelectorAll("[data-project-select]")];
  const elements = panels.map((panel) => ({
    panel,
    title: panel.querySelector(".project-title-row"),
    get media() {
      return panel.querySelector(".project-visual");
    },
    bottom: panel.querySelector(".project-bottom"),
  }));
  const colours = [
    [220, 229, 229],
    [223, 229, 241],
    [239, 231, 219],
    [226, 235, 208],
  ];
  const abort = new AbortController(),
    options = { signal: abort.signal };
  const prepared = new WeakSet();
  let layout,
    origin = 0,
    frame = 0,
    active = -1,
    naturalTops = [],
    naturalBottoms = [],
    reelHeight = 0,
    measuring = false,
    mediaHeight = 400,
    lastPosition = null,
    lastInView = null,
    resizeFrame = 0,
    anchorFrame = 0;
  function prepareMedia(index) {
    const panel = panels[index];
    if (!panel || prepared.has(panel)) return;
    prepared.add(panel);
    panel.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      img.decode().catch(() => {});
    });
    panel.querySelectorAll("video").forEach((video) => {
      if (video.poster) {
        const image = new Image();
        image.src = video.poster;
        image.decode().catch(() => {});
      }
      video.preload = "metadata";
    });
  }
  function selectActive(index) {
    if (active === index) return;
    active = index;
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    reel.dataset.activeProject = panels[index].dataset.showcase;
  }
  function update() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!layout) return;
    const near =
      scrollY + innerHeight + 600 > origin && scrollY < origin + reelHeight;
    if (!layout.enabled) {
      let index = 0;
      naturalTops.forEach((top, i) => {
        if (top < scrollY + innerHeight * 0.55) index = i;
      });
      selectActive(index);
      if (near) {
        prepareMedia(index);
        prepareMedia(index + 1);
      }
      panels.forEach((panel, i) => {
        if (
          naturalBottoms[i] <= scrollY ||
          naturalTops[i] >= scrollY + innerHeight
        )
          panel.querySelectorAll("video").forEach((video) => {
            if (!video.paused) video.pause();
          });
      });
      return;
    }
    const raw = clamp(
      (scrollY - origin + layout.top) / layout.step,
      0,
      panels.length - 1,
    );
    const position = showcasePosition(raw, panels.length),
      index = Math.round(position);
    selectActive(index);
    reel.dataset.position = String(raw);
    const inView =
      scrollY + innerHeight > origin && scrollY < origin + reelHeight;
    if (near) {
      prepareMedia(index);
      prepareMedia(index + 1);
      prepareMedia(index - 1);
    }
    if (position === lastPosition && inView === lastInView) return;
    lastPosition = position;
    lastInView = inView;
    reel.dataset.presentation = position.toFixed(4);
    reel.style.setProperty("--reel-position", String(position));
    const base = Math.floor(position),
      blend = position - base;
    const a = colours[base],
      b = colours[Math.min(base + 1, colours.length - 1)];
    reel.style.backgroundColor = `rgb(${a.map((v, i) => v + (b[i] - v) * blend).join(" ")})`;
    elements.forEach(({ panel, title, media, bottom }, i) => {
      const pose = showcasePose(position, i, mediaHeight, innerWidth <= 600);
      panel.style.visibility = pose.visible ? "visible" : "hidden";
      // Constant paint order: there is no z-index swap at the halfway point.
      if (i !== index && panel.contains(document.activeElement))
        buttons[index].focus({ preventScroll: true });
      panel.inert = i !== index;
      panel.setAttribute("aria-hidden", String(i !== index));
      media.style.transform = `translate3d(0,${pose.y}px,${pose.z}px) rotateX(${pose.rotate}deg) scale(${pose.scale})`;
      title.style.opacity = bottom.style.opacity = String(pose.textOpacity);
      title.style.transform = `translate3d(0,${pose.textY}px,0)`;
      bottom.style.transform = `translate3d(0,${pose.textY * 0.7}px,0)`;
      if (!pose.visible || !inView)
        panel.querySelectorAll("video").forEach((video) => {
          if (!video.paused) video.pause();
        });
      buttons[i].style.setProperty(
        "--index-fill",
        String(clamp(position - i + 1)),
      );
    });
  }
  function measure() {
    if (measuring) return;
    measuring = true;
    layout = prepareShowcase(main, reduced());
    origin = reel.getBoundingClientRect().top + scrollY;
    reelHeight = reel.offsetHeight;
    mediaHeight = panels[0].querySelector(".project-stage").offsetHeight;
    lastPosition = null;
    if (!layout.enabled) {
      reel.style.removeProperty("background-color");
      elements.forEach(({ panel, title, media, bottom }) => {
        panel.inert = false;
        panel.removeAttribute("aria-hidden");
        [panel, title, media, bottom].forEach((el) => {
          el.style.removeProperty("visibility");
          el.style.removeProperty("z-index");
          el.style.removeProperty("transform");
          el.style.removeProperty("opacity");
        });
      });
      naturalTops = panels.map(
        (panel) => panel.getBoundingClientRect().top + scrollY,
      );
      naturalBottoms = panels.map(
        (panel, i) => naturalTops[i] + panel.offsetHeight,
      );
    }
    update();
    measuring = false;
  }
  function refresh() {
    // Only retain a pinned pose. Resizing while approaching or leaving the
    // section must not pull the visitor back into it.
    const pinned =
      layout?.enabled &&
      scrollY >= origin - layout.top &&
      scrollY <= origin - layout.top + layout.step * (panels.length - 1);
    const linearProject =
      !layout?.enabled &&
      active >= 0 &&
      naturalTops[active] < scrollY + innerHeight &&
      naturalBottoms[active] > scrollY;
    const anchor = pinned
      ? { position: Number(reel.dataset.position), index: active, pinned: true }
      : linearProject
        ? { position: active, index: active, pinned: false }
        : null;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      measure();
      if (anchor && (layout.enabled || anchor.pinned)) {
        window.scrollTo({
          top: layout.enabled
            ? origin - layout.top + anchor.position * layout.step
            : naturalTops[anchor.index] - layout.top,
          behavior: "instant",
        });
        update();
      }
    });
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function choose(index, instant = false) {
    const top = layout.enabled
      ? origin - layout.top + index * layout.step
      : naturalTops[index] - layout.top;
    window.scrollTo({
      top,
      behavior: instant || reduced() ? "instant" : "smooth",
    });
  }
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => choose(index), options);
    button.addEventListener(
      "keydown",
      (event) => {
        const next =
          event.key === "ArrowRight"
            ? Math.min(index + 1, panels.length - 1)
            : event.key === "ArrowLeft"
              ? Math.max(index - 1, 0)
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? panels.length - 1
                  : null;
        if (next === null) return;
        event.preventDefault();
        buttons[next].focus({ preventScroll: true });
        choose(next);
      },
      options,
    );
  });
  // Commit the project under the pointer before a native smooth index scroll
  // can move another panel into the same link position between down and up.
  reel.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target.closest("[data-showcase] a"))
        window.scrollTo({ top: scrollY, behavior: "instant" });
    },
    options,
  );
  addEventListener("scroll", schedule, { passive: true, ...options });
  addEventListener("resize", refresh, options);
  addEventListener("motionwillchange", refresh, options);
  const observer = new ResizeObserver(measure);
  observer.observe(main);
  main.addEventListener("loadedmetadata", measure, {
    capture: true,
    ...options,
  });
  // A native anchor points at overlapping articles once the stage is sticky.
  // Resolve it to its actual chapter coordinate on the first page load only;
  // the router owns restoration on subsequent mounts.
  const initialIndex = document.body.hasAttribute("aria-busy")
    ? -1
    : panels.findIndex((panel) => `#${panel.id}` === location.hash);
  document.fonts.ready.then(() => {
    if (abort.signal.aborted) return;
    measure();
    const alignAnchor = () => {
      if (abort.signal.aborted || initialIndex < 0) return;
      anchorFrame = requestAnimationFrame(() => {
        if (`#${panels[initialIndex].id}` !== location.hash) return;
        measure();
        choose(initialIndex, true);
        update();
      });
    };
    // Native fragment scrolling happens at load. Resolve after it, rather than
    // racing it with an earlier font-ready callback.
    if (document.readyState === "complete") alignAnchor();
    else addEventListener("load", alignAnchor, { once: true, ...options });
  });
  measure();
  return () => {
    abort.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(resizeFrame);
    cancelAnimationFrame(anchorFrame);
  };
}
