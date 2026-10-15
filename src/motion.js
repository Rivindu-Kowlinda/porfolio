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
