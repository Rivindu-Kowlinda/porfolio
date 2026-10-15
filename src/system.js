import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createEngine } from "./engine/model.js";
import { gsap } from "gsap";
import { motion } from "./motion.js";
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export async function createSystem(host, { reduced, onLayer }) {
  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.75),
  );
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  host.append(renderer.domElement);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 80);
  const pmrem = new T.PMREMGenerator(renderer),
    room = new RoomEnvironment(),
    env = pmrem.fromScene(room, 0.035);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new T.HemisphereLight(0xe9f2ff, 0x263149, 3));
  const key = new T.DirectionalLight(0xffffff, 5);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new T.DirectionalLight(0x92b2ff, 4);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const engine = createEngine();
  scene.add(engine.root);
  // Soft contact shadow gives the floating object a sense of weight without a costly shadow map.
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d"),
    gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(19,30,58,.3)");
  gr.addColorStop(1, "rgba(19,30,58,0)");
  x.fillStyle = gr;
  x.fillRect(0, 0, 128, 128);
  const shadowTex = new T.CanvasTexture(c),
    shadowMat = new T.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
  const shadow = new T.Mesh(new T.PlaneGeometry(5, 2), shadowMat);
  shadow.position.set(0, -2, -1);
  scene.add(shadow);
  const state = {
    intro: 0,
    route: 1,
    manual: 0,
    override: 0,
    rx: 0,
    ry: 0,
    selected: -1,
  };
  let reducedMotion = reduced(),
    visible = true,
    raf = 0,
    prev = 0,
    time = 0,
    slow = 0,
    quality = renderer.getPixelRatio(),
    stopped = false;
  let hero,
    chapter,
    contact,
    showcases = [],
    casePage = false,
    layout = {},
    lastPose = null,
    routeFrom = null;
  const geometryObserver = new ResizeObserver(measure);
  function measure() {
    const bounds = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + scrollY, height: r.height };
    };
    layout = {
      hero: bounds(hero),
      chapter: bounds(chapter),
      first: bounds(showcases[0]),
      contact: bounds(contact),
    };
    dirty = true;
  }
  const viewportBounds = (r) =>
    r && {
      top: r.top - scrollY,
      bottom: r.top + r.height - scrollY,
      height: r.height,
    };
  const pointer = { x: 0, y: 0 },
    ray = new T.Raycaster();
  let drag = null,
    dirty = true;
  function resize() {
    quality = Math.min(quality, innerWidth < 700 ? 1.35 : 1.75);
    renderer.setPixelRatio(quality);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    measure();
    dirty = true;
  }
  function bindPage() {
    geometryObserver.disconnect();
    const main = document.querySelector("main");
    hero = main.querySelector(".hero");
    chapter = main.querySelector(".engine-chapter");
    contact = main.querySelector(".contact");
    showcases = [...main.querySelectorAll("[data-showcase]")];
    casePage = main.matches("[data-case]");
    gsap.killTweensOf(state, "manual,override,rx,ry");
    geometryObserver.observe(main);
    measure();
    state.manual = 0;
    state.override = 0;
    state.selected = -1;
    state.rx = state.ry = 0;
    dirty = true;
  }
  function sample() {
    const h = innerHeight,
      mobile = innerWidth < 600;
    let px = 0,
      py = 0,
      rz = -0.25,
      rx = 0.28,
      ry = -0.4,
      z = mobile ? 10.7 : 10.4,
      scale = mobile ? 0.55 : 1,
      expl = state.manual * state.override,
      opacity = 1;
    if (hero) {
      const p = clamp(-viewportBounds(layout.hero).top / h);
      rx += p * 0.5;
      ry += p * 1.2;
      rz -= p * 0.25;
      py = mobile ? -0.25 : -0.08;
    }
    if (chapter) {
      const r = viewportBounds(layout.chapter);
      const p = clamp((h - r.top) / (r.height + h));
      if (r.top < h) {
        const enter = T.MathUtils.smoothstep(clamp((h - r.top) / h), 0, 1);
        const mix = (from, to) => T.MathUtils.lerp(from, to, enter);
        px = mix(px, mobile ? 0 : -0.5);
        py = mix(py, mobile ? 0.1 : -0.35);
        rx = mix(rx, 0.3 + p * 0.7);
        ry = mix(ry, -0.3 + p * 1.8);
        rz = mix(rz, -0.3 + p * 0.45);
        expl = T.MathUtils.lerp(
          clamp((p - 0.18) * 2.3) * 1.3,
          state.manual,
          state.override,
        );
        z = mix(z, mobile ? 13.8 : 14.2);
        opacity = 1;
        scale = mix(scale, mobile ? 0.65 : 1);
        rim.intensity = 4 + enter * 2;
      }
    }
    if (showcases.length) {
      const first = viewportBounds(layout.first);
      if (first.top < h) {
        opacity = clamp(first.top / h);
        const exit = 1 - opacity;
        ry += exit;
        scale = T.MathUtils.lerp(scale, 0.8, exit);
      }
    }
    if (contact) {
      const r = viewportBounds(layout.contact);
      if (r.top < h && r.bottom > 0) {
        opacity = 0;
        scale = 0.75;
        px = mobile ? 0 : -2.5;
        py = 0.3;
        z = 11;
        ry = time * 0.1;
      }
    }
    if (casePage) {
      opacity = 0;
    }
    if (reducedMotion) {
      rx = 0.25;
      ry = -0.4;
      rz = -0.25;
      expl = state.manual * state.override;
    }
    if (state.intro > 0) {
      opacity = 1;
      px = mobile ? 0 : 1.3 * state.intro;
      py = 0.2 * state.intro;
      z += state.intro * 2;
      ry += state.intro * 2.5;
      expl = Math.max(expl, state.intro * 3.5);
    }
    let pose = {
      px,
      py,
      rz,
      rx: rx + state.rx + (reducedMotion ? 0 : pointer.y * 0.06),
      ry: ry + state.ry + (reducedMotion ? 0 : pointer.x * 0.08),
      z,
      scale,
      expl,
      opacity,
    };
    if (routeFrom) {
      pose = Object.fromEntries(
        Object.entries(pose).map(([key, value]) => [
          key,
          T.MathUtils.lerp(routeFrom[key], value, state.route),
        ]),
      );
    }
    lastPose = pose;
    engine.root.rotation.set(pose.rx, pose.ry, pose.rz);
    engine.root.position.set(pose.px, pose.py, 0);
    engine.root.scale.setScalar(pose.scale);
    camera.position.set(0, 0, pose.z);
    camera.lookAt(0, 0, 0);
    host.style.opacity = String(pose.opacity);
    engine.update(time, pose.expl, state.selected, reducedMotion);
    shadow.visible = !!hero && !state.intro;
    shadowMat.opacity = clamp(1 - expl * 0.6) * 0.55;
    host.dataset.assembly = pose.expl.toFixed(2);
    host.dataset.rotation = engine.root.rotation.y.toFixed(2);
    host.dataset.motion = reducedMotion ? "reduced" : "full";
    return pose.opacity > 0;
  }
  function frame(now) {
    if (stopped) return;
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = prev ? Math.min((now - prev) / 1000, 0.06) : 0.016;
    prev = now;
    if (!reducedMotion) time += dt;
    if (!dirty && reducedMotion && !gsap.isTweening(state)) return;
    const shouldDraw = sample();
    if (shouldDraw) renderer.render(scene, camera);
    dirty = false;
    // Lower resolution only after sustained slow frames, never raise it mid-session.
    if (shouldDraw && !reducedMotion && dt > 0.035) slow++;
    else slow = Math.max(0, slow - 1);
    if (slow > 100 && quality > 1) {
      quality = Math.max(1, quality - 0.25);
      renderer.setPixelRatio(quality);
      slow = 0;
      resize();
    }
  }
  const abort = new AbortController(),
    options = { signal: abort.signal };
  window.addEventListener("resize", resize, options);
  window.addEventListener("scroll", () => (dirty = true), {
    passive: true,
    ...options,
  });
  document.addEventListener(
    "visibilitychange",
    () => {
      visible = !document.hidden;
      prev = 0;
      dirty = true;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    },
    options,
  );
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!e.target.closest("[data-engine-hit]")) return;
      gsap.killTweensOf(state, "rx,ry");
      drag = {
        x: e.clientX,
        y: e.clientY,
        rx: state.rx,
        ry: state.ry,
        moved: false,
        pointer: e.pointerId,
      };
      e.target.setPointerCapture(e.pointerId);
    },
    options,
  );
  document.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX / innerWidth - 0.5;
      pointer.y = e.clientY / innerHeight - 0.5;
      if (!drag) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) drag.moved = true;
      state.ry = drag.ry + dx * 0.008;
      state.rx = clamp(drag.rx + dy * 0.005, -1, 1);
      dirty = true;
    },
    options,
  );
  document.addEventListener(
    "pointerup",
    (e) => {
      if (!drag) return;
      if (!drag.moved) {
        ray.setFromCamera(
          new T.Vector2(
            (e.clientX / innerWidth) * 2 - 1,
            (-e.clientY / innerHeight) * 2 + 1,
          ),
          camera,
        );
        const hit = ray.intersectObjects(engine.pickables, false)[0];
        if (hit) {
          selectLayer(hit.object.userData.layer);
          onLayer?.(hit.object.userData.layer);
        }
      }
      drag = null;
    },
    options,
  );
  document.addEventListener("pointercancel", () => (drag = null), options);
  document.addEventListener(
    "dblclick",
    (e) => {
      if (e.target.closest("[data-engine-hit]")) reset();
    },
    options,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (!e.target.matches("[data-engine-hit]")) return;
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "Enter",
        ].includes(e.key)
      )
        e.preventDefault();
      if (e.key === "ArrowLeft") state.ry -= 0.2;
      if (e.key === "ArrowRight") state.ry += 0.2;
      if (e.key === "ArrowUp") state.rx -= 0.2;
      if (e.key === "ArrowDown") state.rx += 0.2;
      if (e.key === "Home") reset();
      if (e.key === "Enter") explode(state.manual > 0.2 ? 0 : 1.2);
      dirty = true;
    },
    options,
  );
  const controlState = (assembly, selection = state.selected) =>
    dispatchEvent(
      new CustomEvent("enginechange", { detail: { assembly, selection } }),
    );
  function explode(v) {
    controlState(v);
    gsap.killTweensOf(state, "manual,override");
    state.manual = lastPose?.expl ?? state.manual;
    state.override = 1;
    gsap.to(state, {
      manual: v,
      overwrite: "auto",
      duration: reducedMotion ? 0 : 0.9,
      ease: "power3.inOut",
      onUpdate: () => (dirty = true),
    });
  }
  function reset() {
    controlState(0, -1);
    gsap.killTweensOf(state, "manual,override,rx,ry");
    state.manual = lastPose?.expl ?? state.manual;
    state.override = 1;
    gsap.to(state, {
      override: 0,
      rx: 0,
      ry: 0,
      duration: reducedMotion ? 0 : 0.8,
      ease: motion.travel,
      overwrite: "auto",
      onUpdate: () => (dirty = true),
    });
    state.selected = -1;
  }
  function selectLayer(i) {
    state.selected = i;
    explode(1.35);
    gsap.to(state, {
      ry: i === 2 ? 2.4 : i === 1 ? 0.4 : 0,
      overwrite: "auto",
      duration: reducedMotion ? 0 : 1,
      ease: "power2.inOut",
      onUpdate: () => (dirty = true),
    });
  }
  resize();
  bindPage();
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
  renderer.domElement.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      stopped = true;
      cancelAnimationFrame(raf);
      document.body.classList.add("no-webgl");
      host.style.display = "none";
    },
    options,
  );
  return {
    state,
    bindPage,
    explode,
    reset,
    selectLayer,
    setReduced(value) {
      reducedMotion = value;
      if (value) gsap.getTweensOf(state).forEach((tween) => tween.progress(1));
      dirty = true;
    },
    holdRoute() {
      routeFrom = lastPose && { ...lastPose };
      state.route = 0;
    },
    joinRoute(timeline, duration) {
      timeline.to(
        state,
        {
          route: 1,
          duration,
          ease: motion.travel,
          onUpdate: () => {
            dirty = true;
          },
        },
        0,
      );
    },
    finishRoute() {
      routeFrom = null;
      state.route = 1;
      dirty = true;
    },
    dispose() {
      stopped = true;
      cancelAnimationFrame(raf);
      abort.abort();
      geometryObserver.disconnect();
      gsap.killTweensOf(state);
      engine.dispose();
      env.dispose();
      shadow.geometry.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
