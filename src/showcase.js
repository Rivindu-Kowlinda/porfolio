// One deterministic scroll coordinate owns media, copy, colour and index.
// No scroll interception, snapping or independently chasing tween timelines.
export const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const smooth = (t) => t * t * (3 - 2 * t);
export function showcasePosition(raw, count) {
  const p = clamp(raw, 0, count - 1),
    base = Math.floor(p);
  return base + smooth(clamp((p - base - 0.22) / 0.58));
}
export function showcasePose(position, index) {
  const distance = clamp(index - position, -1, 1),
    weight = 1 - Math.abs(distance);
  return {
    weight,
    copy: smooth(clamp((weight - 0.48) / 0.52)),
    y: distance * 48,
    scale: 1 - Math.abs(distance) * 0.055,
    rotate: distance * 3,
    textY: distance * 28,
  };
}
export function showcaseLayout(count, width, height) {
  const top = width <= 600 ? 64 : 74;
  const stage = Math.min(height - top, width <= 600 ? 700 : 950);
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
    reelHeight = 0,
    measuring = false;
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
    reel.dataset.presentation = position.toFixed(4);
    reel.style.setProperty("--reel-position", String(position));
    const base = Math.floor(position),
      blend = position - base;
    const a = colours[base],
      b = colours[Math.min(base + 1, colours.length - 1)];
    reel.style.backgroundColor = `rgb(${a.map((v, i) => v + (b[i] - v) * blend).join(" ")})`;
    elements.forEach(({ panel, title, media, bottom }, i) => {
      const pose = showcasePose(position, i),
        visible = pose.weight > 0.0001;
      panel.style.visibility = visible ? "visible" : "hidden";
      panel.style.zIndex = i === index ? "2" : "1";
      if (i !== index && panel.contains(document.activeElement))
        buttons[index].focus({ preventScroll: true });
      panel.inert = i !== index;
      panel.setAttribute("aria-hidden", String(i !== index));
      media.style.opacity = String(pose.weight);
      // Match CSSPlugin's transform order so a partial scroll pose can also
      // be interpolated exactly by the shared-element route timeline.
      media.style.transform = `translate3d(0,${pose.y}px,0) rotateX(${pose.rotate}deg) scale(${pose.scale})`;
      title.style.opacity = bottom.style.opacity = String(pose.copy);
      title.style.transform = `translate3d(0,${pose.textY}px,0)`;
      bottom.style.transform = `translate3d(0,${pose.textY * 0.5}px,0)`;
      if (!visible)
        panel.querySelectorAll("video").forEach((video) => {
          if (!video.paused) video.pause();
        });
      buttons[i].style.setProperty(
        "--index-fill",
        String(clamp(position - i + 1)),
      );
    });
    if (near) {
      prepareMedia(index);
      prepareMedia(index + 1);
    }
  }
  function measure() {
    if (measuring) return;
    measuring = true;
    layout = prepareShowcase(main, reduced());
    origin = reel.getBoundingClientRect().top + scrollY;
    reelHeight = reel.offsetHeight;
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
    }
    update();
    measuring = false;
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  function choose(index) {
    const top = layout.enabled
      ? origin - layout.top + index * layout.step
      : naturalTops[index] - layout.top;
    window.scrollTo({ top, behavior: reduced() ? "instant" : "smooth" });
  }
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => choose(index), options);
    button.addEventListener(
      "keydown",
      (event) => {
        const next =
          event.key === "ArrowRight"
            ? (index + 1) % panels.length
            : event.key === "ArrowLeft"
              ? (index + panels.length - 1) % panels.length
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
  addEventListener("resize", measure, options);
  addEventListener("motionchange", measure, options);
  const observer = new ResizeObserver(measure);
  observer.observe(main);
  measure();
  return () => {
    abort.abort();
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}
