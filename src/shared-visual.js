// Carry the actual visual tree (including video state and CSS perspective),
// rather than flattening a transformed image into its bounding rectangle.
const geometry = [
  "width",
  "height",
  "left",
  "top",
  "right",
  "bottom",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "transform",
  "transformOrigin",
  "perspective",
  "perspectiveOrigin",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "borderRadius",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "opacity",
];
const tree = (root) => [root, ...root.querySelectorAll("*")];
function snapshot(root) {
  return tree(root).map((node) => {
    const computed = getComputedStyle(node);
    const css = [...computed]
      .map((key) => `${key}:${computed.getPropertyValue(key)};`)
      .join("");
    const bounds = node.getBoundingClientRect();
    return {
      node,
      css,
      bounds,
      original: node.getAttribute("style"),
      values: Object.fromEntries(geometry.map((key) => [key, computed[key]])),
    };
  });
}
export function carryVisual(source) {
  if (!source) return null;
  const rect = source.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > innerHeight) return null;
  const snapshots = snapshot(source);
  const initial = snapshots.slice(1).map(({ bounds }) => bounds);
  const placeholder = document.createElement("div");
  placeholder.style.cssText = `height:${source.offsetHeight}px;margin:${getComputedStyle(source).margin};`;
  source.replaceWith(placeholder);
  snapshots.forEach(({ node, css, values }) => {
    node.style.cssText = css;
    // Logical/shorthand computed properties can overwrite their physical
    // counterparts when serialised. Apply resolved geometry last.
    Object.assign(node.style, values);
  });
  Object.assign(source.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    transform: "none",
    zIndex: "22",
    pointerEvents: "none",
    visibility: "visible",
  });
  source.dataset.routeVisual = "";
  source.setAttribute("aria-hidden", "true");
  document.body.append(source);
  const initialError = Math.max(
    0,
    ...tree(source)
      .slice(1)
      .flatMap((node, i) => {
        const r = node.getBoundingClientRect();
        return ["x", "y", "width", "height"].map((key) =>
          Math.abs(r[key] - initial[i][key]),
        );
      }),
  );
  let destination, destinationSnapshots;
  return {
    startErrorPx: initialError,
    animate(timeline, dest, duration, ease) {
      destination = dest;
      const end = snapshot(dest),
        r = dest.getBoundingClientRect();
      destinationSnapshots = end;
      dest.style.visibility = "hidden";
      timeline.to(
        source,
        {
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          perspectiveOrigin: end[0].values.perspectiveOrigin,
          duration,
          ease,
          autoRound: false,
        },
        0,
      );
      snapshots.slice(1).forEach((start, i) => {
        const target = end[i + 1];
        if (!target) return;
        const changes = {};
        geometry.forEach((key) => {
          if (start.values[key] !== target.values[key])
            changes[key] = target.values[key];
        });
        if (Object.keys(changes).length)
          timeline.to(
            start.node,
            { ...changes, duration, ease, autoRound: false },
            0,
          );
      });
    },
    finish() {
      let error = null;
      if (destination) {
        const before = tree(source)
          .slice(1)
          .map((node) => node.getBoundingClientRect());
        const visual = source.firstElementChild;
        snapshots.slice(1).forEach(({ node }, i) => {
          // The incoming showcase may have its own scroll pose. Restore that
          // pose, not the outgoing page's inline animation styles.
          const original = destinationSnapshots[i + 1].original;
          if (original === null) node.removeAttribute("style");
          else node.setAttribute("style", original);
          // CSSPlugin must re-read the restored stylesheet on the next tween.
          if (node._gsap) node._gsap.uncache = 1;
        });
        destination.replaceChildren(visual);
        destination.style.removeProperty("visibility");
        const after = tree(visual).map((node) => node.getBoundingClientRect());
        error = Math.max(
          0,
          ...after.flatMap((r, i) =>
            ["x", "y", "width", "height"].map((k) =>
              Math.abs(r[k] - before[i][k]),
            ),
          ),
        );
      }
      source.remove();
      placeholder.remove();
      return error;
    },
    discard() {
      source.remove();
      placeholder.remove();
    },
  };
}
