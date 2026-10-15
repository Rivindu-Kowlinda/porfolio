import assert from "node:assert/strict";
import { stageOffset, clampScroll, introPose } from "../src/motion.js";
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
console.log(
  "Motion math verified: exact intro endpoints, continuous responsive handoff, reversible parallax, reduced motion and scroll restoration.",
);
