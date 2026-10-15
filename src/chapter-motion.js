// Small, isolated chapter controllers. Scroll only schedules work; geometry is
// cached on layout changes, and the conceptual graph draws only while visible.
export function mountChapters(main, reduced) {
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const chapters = [...main.querySelectorAll("[data-progress-chapter]")];
  const reveals = [...main.querySelectorAll("[data-scroll-reveal]")];
  const steps = [...main.querySelectorAll("[data-process-step]")];
  const links = [...main.querySelectorAll(".process-nav a")];
  const canvas = main.querySelector("[data-neural-map]");
  const label = main.querySelector("[data-neural-label]");
  let chapterBounds = [],
    revealBounds = [],
    stepBounds = [],
    scrollFrame = 0;
  let stage = 0,
    graphFrame = 0,
    inView = false,
    lastTime = 0,
    time = 0,
    yaw = -0.3,
    drag = null;
  let width = 1,
    height = 1;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ctx = canvas?.getContext("2d");
  const points = Array.from({ length: 120 }, (_, i) => {
    const t = i * 2.39996323,
      y = 1 - (2 * ((i % 60) + 0.5)) / 60;
    const r = Math.sqrt(1 - y * y),
      side = i < 60 ? -1 : 1;
    return {
      x: side * 0.57 + Math.cos(t) * r * 0.6,
      y: y * 0.72,
      z: Math.sin(t) * r * 0.52,
      seed: i / 120,
    };
  });
  const edges = points.flatMap((p, i) =>
    points
      .slice(i + 1)
      .map((q, j) => ({
        a: i,
        b: j + i + 1,
        d: Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z),
      }))
      .filter((e) => e.d < 0.43),
  );
  const absolute = (el) => {
    const r = el.getBoundingClientRect();
    return { el, top: r.top + scrollY, height: r.height };
  };
  function measure() {
    // Reveal translation must not feed back into its own scroll measurement.
    reveals.forEach((el) => el.classList.remove("reveal-ready"));
    chapterBounds = chapters.map(absolute);
    revealBounds = reveals.map(absolute);
    stepBounds = steps.map(absolute);
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      width = r.width;
      height = r.height;
      const ratio = Math.min(devicePixelRatio, 1.75);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    updateScroll();
    draw();
  }
  function updateScroll() {
    scrollFrame = 0;
    const h = innerHeight;
    chapterBounds.forEach(({ el, top, height }) =>
      el.style.setProperty(
        "--chapter-progress",
        String(clamp((scrollY + h * 0.5 - top) / (height - h * 0.15))),
      ),
    );
    revealBounds.forEach(({ el, top }) => {
      el.style.setProperty(
        "--reveal",
        String(reduced() ? 1 : clamp((scrollY + h * 0.92 - top) / (h * 0.5))),
      );
      el.classList.add("reveal-ready");
    });
    if (stepBounds.length) {
      let next = 0;
      stepBounds.forEach(({ top }, i) => {
        if (top < scrollY + h * 0.6) next = i;
      });
      stage = next;
      links.forEach((link, i) => {
        if (i === next) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
      if (label)
        label.textContent = [
          "01 / CONNECTIVITY",
          "02 / RECURRENT PROCESSING",
          "03 / LIVE INTERFACE",
        ][next];
      if (canvas) canvas.dataset.stage = String(next);
      if (reduced()) draw();
    }
  }
  function schedule() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }
  function draw() {
    if (!ctx || !width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const angle = yaw + (reduced() ? 0 : time * 0.055),
      c = Math.cos(angle),
      s = Math.sin(angle);
    const scale = Math.min(width * 0.31, height * 0.39);
    const projected = points.map((p) => {
      const x = p.x * c + p.z * s,
        z = p.z * c - p.x * s,
        perspective = 3.5 / (3.5 + z);
      return {
        x: width / 2 + x * scale * perspective,
        y: height / 2 + p.y * scale * perspective - 10,
        z,
      };
    });
    edges.forEach((e, i) => {
      const a = projected[e.a],
        b = projected[e.b];
      ctx.strokeStyle = `rgba(143,190,182,${0.1 + (0.5 - (a.z + b.z) / 4) * 0.12})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      if (!reduced() && i % 13 === stage) {
        const t = (time * 0.27 + i * 0.13) % 1;
        ctx.fillStyle = "#d2f4d0";
        ctx.beginPath();
        ctx.arc(
          a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
          1.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    });
    projected.forEach((p, i) => {
      const active = (i + stage * 11) % 9 === 0;
      ctx.fillStyle = active
        ? "#d6f3bd"
        : `rgba(150,201,194,${0.35 + (0.5 - p.z) * 0.25})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 2.7 : 1.3, 0, Math.PI * 2);
      ctx.fill();
      if (active) {
        ctx.strokeStyle = "#d6f3bd28";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }
  function frame(now) {
    graphFrame = 0;
    if (!inView || document.hidden || reduced()) return;
    time += lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;
    draw();
    graphFrame = requestAnimationFrame(frame);
  }
  function syncGraph() {
    cancelAnimationFrame(graphFrame);
    graphFrame = 0;
    lastTime = 0;
    draw();
    if (inView && !document.hidden && !reduced())
      graphFrame = requestAnimationFrame(frame);
  }
  const resize = new ResizeObserver(measure);
  resize.observe(main);
  const intersection = canvas
    ? new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting;
          syncGraph();
        },
        { rootMargin: "50px" },
      )
    : null;
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Conceptual neural graph. Drag horizontally or use left and right arrow keys to rotate.",
    );
    intersection.observe(canvas);
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        drag = { x: e.clientX, yaw };
        canvas.setPointerCapture(e.pointerId);
      },
      options,
    );
    canvas.addEventListener(
      "pointermove",
      (e) => {
        if (!drag) return;
        yaw = drag.yaw + (e.clientX - drag.x) * 0.007;
        draw();
      },
      options,
    );
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      canvas.addEventListener(
        type,
        () => {
          drag = null;
        },
        options,
      );
    canvas.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          yaw += e.key === "ArrowLeft" ? -0.2 : 0.2;
          draw();
        }
      },
      options,
    );
  }
  addEventListener("scroll", schedule, { passive: true, ...options });
  addEventListener("resize", measure, options);
  addEventListener(
    "motionchange",
    () => {
      updateScroll();
      syncGraph();
    },
    options,
  );
  document.addEventListener("visibilitychange", syncGraph, options);
  measure();
  return () => {
    abort.abort();
    resize.disconnect();
    intersection?.disconnect();
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(graphFrame);
  };
}
