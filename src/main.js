import { gsap } from "gsap";
import { mountPlayground } from "./pathfinder.js";
import { createRouter } from "./router.js";
import { animateDialog } from "./dialog-motion.js";
import { mountAccordions } from "./accordion.js";
import { stageOffset } from "./motion.js";
import { profile } from "./content.js";
const $ = (s) => document.querySelector(s);
let scene = null,
  pageCleanup = () => {},
  scrollFrame = 0,
  introTimeline = null;
const mediaQuery = matchMedia("(prefers-reduced-motion: reduce)");
let motionOverride = null;
try {
  motionOverride = localStorage.getItem("rk-motion");
} catch {}
const reduced = () =>
  motionOverride === null ? mediaQuery.matches : motionOverride === "reduced";
const toast = (text) => {
  $("#toast").textContent = text;
  $("#toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("visible"), 2600);
};
function syncMotion() {
  document.body.classList.toggle("reduced-motion", reduced());
  $("#motion-toggle").setAttribute("aria-pressed", String(reduced()));
  $("#motion-toggle").setAttribute(
    "aria-label",
    reduced() ? "Enable full motion" : "Reduce motion",
  );
  $("#motion-toggle").textContent = reduced() ? "▷" : "Ⅱ";
  scene?.setReduced(reduced());
  if (reduced()) {
    finishIntro();
    const letters = document.querySelectorAll(".hero-name>span");
    if (letters.length) {
      gsap.killTweensOf(letters);
      gsap.set(letters, { clearProps: "transform" });
    }
  }
  dispatchEvent(new Event("motionchange"));
}
$("#motion-toggle").addEventListener("click", () => {
  motionOverride = reduced() ? "full" : "reduced";
  try {
    localStorage.setItem("rk-motion", motionOverride);
  } catch {}
  syncMotion();
  toast(reduced() ? "Reduced motion enabled" : "Full motion enabled");
});
mediaQuery.addEventListener("change", syncMotion);
const menu = $("#site-menu"),
  menuToggle = $(".menu-toggle");
const menuMotion = animateDialog(menu, reduced, (open) => {
  document.body.classList.toggle("menu-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
});
const closeMenu = (immediate = false) => menuMotion.close(immediate);
menuToggle.addEventListener("click", () =>
  menu.open ? closeMenu() : menuMotion.open(),
);
$(".menu-close").addEventListener("click", () => closeMenu());
const messageMotion = animateDialog($("#message-dialog"), reduced);
const layerText = [
  [
    "The outer shell. Where structure becomes an experience people can understand.",
    "See it in Axion ↗",
    "axion.html",
  ],
  [
    "The logic cartridge. A changing system needs clear rules, safe decisions and predictable state.",
    "See it in Snake Battle ↗",
    "snake.html",
  ],
  [
    "The circuit carrier. Interfaces, services and data become useful when they work together.",
    "See it in Ticket Manager ↗",
    "OOP.html",
  ],
];
function showLayer(i) {
  const info = layerText[i];
  if (!$("#layer-description")) return;
  $("#layer-description").textContent = info[0];
  $("#layer-link").textContent = info[1];
  $("#layer-link").href = info[2];
  document
    .querySelectorAll("[data-layer]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(Number(b.dataset.layer) === i)),
    );
  const range = $('[aria-label="Engine exploded view"]');
  if (range) range.value = (1.35 / 1.6) * 100;
}
function mount() {
  const main = document.querySelector("main");
  const cleanups = [...main.querySelectorAll("[data-playground]")].map((r) =>
    mountPlayground(r, reduced),
  );
  cleanups.push(mountAccordions(main, reduced));
  const abort = new AbortController(),
    opt = { signal: abort.signal };
  addEventListener(
    "enginechange",
    ({ detail }) => {
      const button = main.querySelector('[data-engine-action="explode"]');
      if (button) {
        button.setAttribute("aria-pressed", String(detail.assembly > 0.05));
        button.textContent =
          detail.assembly > 0.05 ? "ASSEMBLE −" : "EXPLODE +";
      }
      const range = main.querySelector('[aria-label="Engine exploded view"]');
      if (range) range.value = (detail.assembly / 1.6) * 100;
      main
        .querySelectorAll("[data-layer]")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(Number(button.dataset.layer) === detail.selection),
          ),
        );
    },
    opt,
  );

  main.querySelectorAll("[data-engine-action]").forEach((b) =>
    b.addEventListener(
      "click",
      () => {
        if (b.dataset.engineAction === "reset") {
          scene?.reset();
          main
            .querySelector('[data-engine-action="explode"]')
            ?.setAttribute("aria-pressed", "false");
          const explodeButton = main.querySelector(
            '[data-engine-action="explode"]',
          );
          if (explodeButton) explodeButton.textContent = "EXPLODE +";
          const r = $('[aria-label="Engine exploded view"]');
          if (r) r.value = 0;
          return;
        }
        const active = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", String(active));
        b.textContent = active ? "ASSEMBLE −" : "EXPLODE +";
        scene?.explode(active ? 1.35 : 0);
      },
      opt,
    ),
  );
  main.querySelectorAll("[data-layer]").forEach((b) =>
    b.addEventListener(
      "click",
      () => {
        const i = Number(b.dataset.layer);
        showLayer(i);
        scene?.selectLayer(i);
      },
      opt,
    ),
  );
  $('[aria-label="Engine exploded view"]')?.addEventListener(
    "input",
    (e) => scene?.explode((Number(e.target.value) / 100) * 1.6),
    opt,
  );
  $("[data-copy-email]")?.addEventListener(
    "click",
    async () => {
      try {
        await navigator.clipboard.writeText(profile.email);
        toast("Email address copied");
      } catch {
        toast(profile.email);
      }
    },
    opt,
  );
  $("[data-message]")?.addEventListener(
    "click",
    () => messageMotion.open(),
    opt,
  );
  const stages = [...main.querySelectorAll(".project-stage")],
    heroName = main.querySelector(".hero-name");
  let metrics = [];
  function measureStages() {
    metrics = stages.map((stage) => {
      const r = stage.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(stage).transform);
      return { stage, top: r.top + scrollY - matrix.m42, height: r.height };
    });
    choreograph();
  }
  function choreograph() {
    scrollFrame = 0;
    const h = innerHeight;
    if (heroName) {
      const p = Math.max(0, Math.min(1, scrollY / h));
      heroName.style.transform = reduced()
        ? "none"
        : `translate3d(0,${-p * 100}px,0) scale(${1 + p * 0.06})`;
    }
    metrics.forEach(({ stage, top, height }) => {
      const visible = top + height > scrollY && top < scrollY + h;
      stage.style.willChange = visible && !reduced() ? "transform" : "auto";
      stage.style.transform = `translate3d(0,${stageOffset(top, height, h, scrollY, reduced())}px,0)`;
    });
  }
  const observer = new ResizeObserver(measureStages);
  observer.observe(main);
  cleanups.push(() => observer.disconnect());
  const scroll = () => {
    document
      .querySelector(".site-header")
      .classList.toggle("scrolled", scrollY > 60);
    if (!scrollFrame) scrollFrame = requestAnimationFrame(choreograph);
  };
  addEventListener("scroll", scroll, { passive: true, ...opt });
  addEventListener("resize", measureStages, opt);
  addEventListener("motionchange", measureStages, opt);
  measureStages();
  pageCleanup = () => {
    abort.abort();
    cleanups.forEach((f) => f());
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    main.querySelectorAll("video").forEach((v) => v.pause());
  };
}
$(".dialog-close").addEventListener("click", () => messageMotion.close());
$("#contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.currentTarget,
    button = form.querySelector('button[type="submit"]'),
    status = form.querySelector(".form-status");
  if (button.disabled) return;
  button.disabled = true;
  status.textContent = "Sending your message…";
  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Delivery failed");
    form.reset();
    status.textContent = "Thank you. Your message has been sent.";
  } catch {
    status.textContent = `Your message could not be sent. Email ${profile.email} instead.`;
  } finally {
    button.disabled = false;
  }
});
function finishIntro() {
  introTimeline?.kill();
  if (scene) {
    gsap.killTweensOf(scene.state, "intro");
    scene.state.intro = 0;
  }
  document.body.classList.remove("introducing");
  if ($("#intro")) $("#intro").hidden = true;
  try {
    sessionStorage.setItem("rk-intro-v2", "seen");
  } catch {}
}
async function boot() {
  mount();
  syncMotion();
  createRouter({
    system: () => scene,
    mount,
    unmount: () => pageCleanup(),
    reduced,
    closeMenu,
  });
  let seen = false;
  try {
    seen = sessionStorage.getItem("rk-intro-v2") === "seen";
  } catch {}
  const intro = $("#intro");
  const play =
    !!intro && !seen && !reduced() && !location.hash && scrollY < 100;
  if (play) {
    intro.hidden = false;
    document.body.classList.add("introducing");
    $("#skip-intro").addEventListener("click", finishIntro);
  }
  // Escape hatch if WebGL or the dynamic import is unavailable: HTML is always usable.
  const timeout = setTimeout(finishIntro, 6500);
  try {
    if (new URLSearchParams(location.search).get("graphics") === "off")
      throw new Error("Static graphics requested");
    const { createSystem } = await import("./system.js");
    scene = await createSystem($("#world"), { reduced, onLayer: showLayer });
    if (play && document.body.classList.contains("introducing")) {
      scene.state.intro = 1;
      introTimeline = gsap.timeline({ onComplete: finishIntro });
      introTimeline
        .to(scene.state, { intro: 0.55, duration: 1.3, ease: "power2.out" })
        .call(
          () =>
            ($("#intro-status").textContent = "ASSEMBLING THE POSSIBILITIES"),
        )
        .to(scene.state, { intro: 0, duration: 1.9, ease: "power3.inOut" })
        .to(".intro-copy", { y: -35, opacity: 0, duration: 0.55 }, "-=.35")
        .call(() => {
          document.body.classList.remove("introducing");
          intro.hidden = true;
          gsap.fromTo(
            ".hero-name>span",
            { y: 50 },
            { y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" },
          );
        });
    } else finishIntro();
  } catch (error) {
    document.body.classList.add("no-webgl");
    finishIntro();
    console.info(
      "3D enhancement unavailable; using the accessible HTML experience.",
    );
  }
  clearTimeout(timeout);
}
boot();
addEventListener("pagehide", (e) => {
  if (!e.persisted) {
    pageCleanup();
    scene?.dispose();
  }
});
