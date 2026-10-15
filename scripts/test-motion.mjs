import assert from "node:assert/strict";
import { stageOffset, clampScroll } from "../src/motion.js";
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
console.log(
  "Motion math verified: reversible parallax, bounded offscreen transforms, reduced motion and scroll restoration.",
);
