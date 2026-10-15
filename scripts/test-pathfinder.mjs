import assert from "node:assert/strict";
import { solveGrid } from "../src/pathfinder.js";
const direct = solveGrid(14, 10, 0, 139, new Set());
assert.equal(
  direct.path.length - 1,
  22,
  "BFS must find the Manhattan shortest path on an empty board",
);
for (let i = 1; i < direct.path.length; i++) {
  const a = direct.path[i - 1],
    b = direct.path[i];
  assert.equal(
    Math.abs((a % 14) - (b % 14)) +
      Math.abs(Math.floor(a / 14) - Math.floor(b / 14)),
    1,
    "Steps must be orthogonally adjacent, never wrap a row",
  );
}
const wall = new Set([1, 4, 7]);
assert.equal(
  solveGrid(3, 3, 0, 8, wall).found,
  false,
  "A complete barrier is unreachable",
);
const detour = solveGrid(5, 5, 10, 14, new Set([11, 12, 13]));
assert.equal(detour.path.length - 1, 6);
assert.ok(detour.path.every((n) => ![11, 12, 13].includes(n)));
assert.deepEqual(solveGrid(3, 3, 4, 4, new Set()).path, [4]);
assert.equal(
  new Set(direct.order).size,
  direct.order.length,
  "Every visited node appears once",
);
console.log(
  "BFS verified: shortest route, orthogonal adjacency, barriers, detours, identical endpoints and unique visits.",
);
