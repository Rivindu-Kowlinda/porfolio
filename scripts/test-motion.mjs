import assert from "node:assert/strict";
import { routeAnchor } from "../src/router.js";
import { stageOffset, clampScroll, introPose } from "../src/motion.js";
import {
  showcasePosition,
  showcasePose,
  showcaseLayout,
  showcaseDestination,
} from "../src/showcase.js";
// Regression: transformed bounding boxes must never feed back into the next
// scroll calculation. Revisiting a position has the same deterministic offset.
const positions = [0, 300, 760, 1800, 760, 300, 0];
const offsets = positions.map((scroll) =>
  stageOffset(800, 650, 900, scroll, false),
);
assert.equal(offsets[0], offsets.at(-1));
assert.equal(offsets[1], offsets.at(-2));
assert.equal(offsets[2], offsets.at(-3));
assert.equal(stageOffset(800, 650, 900, 675, false), 0);
assert.equal(stageOffset(800, 650, 900, 675, true), 0);
assert.ok(Math.abs(stageOffset(20000, 650, 900, 0, false)) <= 36);
// History restoration must remain valid after content or viewport size changes.
assert.equal(clampScroll(2300, 1800, 900), 900);
assert.equal(clampScroll(400, 600, 900), 0);
assert.equal(clampScroll(-80, 3000, 900), 0);
assert.equal(clampScroll(850, 3000, 900), 850);
// Regression: the old intro approached Y=0, then snapped to the responsive
// hero Y (-0.08 / -0.25) on the first idle frame.
for (const mobile of [false, true]) {
  const base = {
    px: 0,
    py: mobile ? -0.25 : -0.08,
    z: mobile ? 10.7 : 10.4,
    ry: -0.4,
    rx: 0.28,
    rz: -0.25,
    scale: mobile ? 0.55 : 1,
    expl: 0,
    opacity: 1,
  };
  assert.deepEqual(introPose(base, 0, mobile), base);
  const ending = introPose(base, 1e-7, mobile);
  for (const key of Object.keys(base))
    assert.ok(
      Math.abs(ending[key] - base[key]) < 1e-6,
      `Intro endpoint discontinuity: ${key}, mobile=${mobile}`,
    );
  assert.equal(introPose(base, 1, mobile).py, 0.2);
}
// Scroll direction cannot change a frame: every project shares one coordinate.
const forward = Array.from({ length: 301 }, (_, i) => i / 100);
const reverse = forward.slice().reverse();
assert.deepEqual(
  forward.map((p) => showcasePosition(p, 4)),
  reverse.map((p) => showcasePosition(p, 4)).reverse(),
);
for (const mobile of [false, true]) {
  const frames = forward.map((raw) =>
    [0, 1, 2, 3].map((i) =>
      showcasePose(showcasePosition(raw, 4), i, 400, mobile),
    ),
  );
  assert.deepEqual(
    frames,
    reverse
      .map((raw) =>
        [0, 1, 2, 3].map((i) =>
          showcasePose(showcasePosition(raw, 4), i, 400, mobile),
        ),
      )
      .reverse(),
  );
  for (const poses of frames) {
    const visible = poses.filter((p) => p.visible);
    assert.ok(visible.length >= 1 && visible.length <= 2);
    assert.ok(
      visible.every((p) => p.z <= 0 && p.scale >= 0.965 && p.scale <= 1),
    );
  }
  for (let i = 0; i < 4; i++) {
    assert.equal(showcasePosition(i, 4), i);
    const pose = showcasePose(i, i, 400, mobile);
    assert.ok(pose.visible);
    for (const key of ["y", "z", "rotate", "textY"])
      assert.ok(
        Math.abs(pose[key]) < 1e-10,
        `Unsettled ${key} at chapter ${i}`,
      );
    assert.equal(pose.scale, 1);
    assert.equal(pose.textOpacity, 1);
  }
  // Vertical travel dominates throughout: no orbit, reversal, backface or
  // extreme rotation. Both boundary endpoints are completely beyond the mask.
  for (const height of [180, 400, 900]) {
    let priorOutgoing = 0,
      priorIncoming = height + 32;
    for (let step = 0; step <= 1000; step++) {
      const position = step / 1000;
      const outgoing = showcasePose(position, 0, height, mobile);
      const incoming = showcasePose(position, 1, height, mobile);
      assert.ok(outgoing.y <= priorOutgoing && incoming.y <= priorIncoming);
      assert.ok(
        Math.abs(outgoing.rotate) <= 14 && Math.abs(incoming.rotate) <= 8,
      );
      assert.ok(
        outgoing.textOpacity === 0 || incoming.textOpacity === 0,
        "Two project headings are visible simultaneously",
      );
      priorOutgoing = outgoing.y;
      priorIncoming = incoming.y;
    }
    assert.ok(priorOutgoing < -height);
    assert.equal(priorIncoming, 0);
  }
  // No abrupt pose change at project boundaries or the active-index
  // handoff. Visibility may change only where the plane is outside the mask
  // of the viewport; transform values themselves remain continuous.
  let previous = null;
  for (let step = 0; step <= 3000; step++) {
    const poses = [0, 1, 2, 3].map((i) =>
      showcasePose(showcasePosition(step / 1000, 4), i, 400, mobile),
    );
    if (previous)
      poses.forEach((p, i) => {
        assert.ok(Math.abs(p.rotate - previous[i].rotate) < 0.3);
        assert.ok(Math.abs(p.y - previous[i].y) < 1.1);
        assert.ok(Math.abs(p.z - previous[i].z) < 1.1);
      });
    previous = poses;
  }
  const outgoing = showcasePose(0.5, 0, 400, mobile);
  const incoming = showcasePose(0.5, 1, 400, mobile);
  assert.ok(outgoing.rotate > 0 && outgoing.y < 0 && outgoing.z < 0);
  assert.ok(incoming.rotate < 0 && incoming.y > 0 && incoming.z < 0);
  assert.equal(outgoing.y, -incoming.y);
  assert.equal(outgoing.z, incoming.z);
}
assert.equal(showcasePosition(-10, 4), 0);
assert.equal(showcasePosition(9, 4), 3);
const phone = showcaseLayout(4, 390, 844),
  desktop = showcaseLayout(4, 1280, 800);
assert.equal(phone.stage, 844 - phone.top);
assert.equal(desktop.stage, 800 - desktop.top);
assert.equal(phone.total - phone.stage, phone.step * 3);

// Direct anchors and responsive return routes use chapter offsets, never the
// bounding box of one of the overlapping absolute-positioned articles.
for (const [width, height] of [
  [1280, 800],
  [768, 1024],
  [390, 844],
  [320, 650],
  [1280, 1200],
]) {
  globalThis.innerWidth = width;
  globalThis.innerHeight = height;
  const panels = ["chess", "axion", "tree", "snake"].map((id) => ({
    dataset: { showcase: id },
  }));
  const reel = {
    querySelectorAll: () => panels,
    getBoundingClientRect: () => ({ top: 2400 }),
  };
  const main = { querySelector: () => reel };
  const layout = showcaseLayout(4, width, height);
  assert.equal(layout.stage + layout.top, height);
  for (const progress of [0, 0.2, 1.5, 2.8, 3]) {
    const nextSectionTop = layout.total - progress * layout.step + layout.top;
    assert.ok(
      nextSectionTop >= height,
      "Next section exposed before final project",
    );
  }
  assert.equal(
    showcaseDestination(main, "tree"),
    2400 - layout.top + 2 * layout.step,
  );
  assert.equal(
    showcaseDestination(main, "axion", 1.38),
    2400 - layout.top + 1.38 * layout.step,
  );
  assert.equal(showcaseDestination(main, "removed-project"), null);
  assert.equal(
    showcaseDestination({ querySelector: () => null }, "tree"),
    null,
  );
}
delete globalThis.innerWidth;
delete globalThis.innerHeight;
// Regression: an empty hash used to produce an empty string, and reading
// anchor?.dataset.showcase threw before every normal case-page transition.
assert.equal(
  routeAnchor(
    {
      querySelector() {
        throw new Error("Unexpected query");
      },
    },
    "",
  ),
  null,
);
assert.equal(routeAnchor({}, undefined), null);
console.log(
  "Motion math verified: intro endpoints, reversible vertical folds, bounded tilt, exclusive headings, continuous handoffs, fragment-free routes, responsive anchors, full-viewport stage sizing and scroll restoration. Browser visual verification is separate.",
);
