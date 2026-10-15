// Related timing curves, with one owner per animated property.
export const motion = Object.freeze({
  route: 0.92,
  accordion: 0.46,
  micro: 0.22,
  dialog: 0.34,
  travel: "power3.inOut",
  reveal: "power3.out",
});

export function stageOffset(top, height, viewport, scroll, reduced) {
  return reduced
    ? 0
    : Math.max(
        -36,
        Math.min(
          36,
          ((top - scroll + height / 2 - viewport / 2) / viewport) * 36,
        ),
      );
}

export function clampScroll(value, height, viewport) {
  return Math.max(0, Math.min(value, Math.max(0, height - viewport)));
}

// The intro is an offset from the live hero pose, including its responsive Y.
// At zero it is exactly the hero pose; there is no second coordinate system.
export function introPose(base, progress, mobile) {
  const t = Math.max(0, Math.min(1, progress));
  return {
    ...base,
    px: base.px + (mobile ? 0 : 1.3) * t,
    py: base.py + (0.2 - base.py) * t,
    z: base.z + 2 * t,
    ry: base.ry + 2.5 * t,
    expl: Math.max(base.expl, 3.5 * t),
  };
}
