import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { projects, profile, skillGroups } from "../src/content.js";
import { projectPaths } from "../src/render-project.js";
assert.deepEqual(
  projects.map((p) => p.id),
  ["chess", "axion", "tree", "snake"],
);
const home = readFileSync("index.html", "utf8");
assert.ok(
  home.includes('id="experience"') &&
    home.includes("hSenid") &&
    home.includes("July 2025"),
);
assert.ok(home.includes(profile.email));
assert.ok(home.includes("Selected work <sup>04</sup>"));
for (const p of projects) {
  const html = readFileSync(projectPaths[p.id], "utf8");
  for (const value of [p.challenge, p.solution, ...p.details])
    assert.ok(
      html.replace(/\s+/g, " ").includes(value.replace(/\s+/g, " ")),
      `${p.id}: missing ${value}`,
    );
  for (const asset of [...p.images, ...(p.video ? [p.video] : [])])
    assert.ok(existsSync(asset), `Missing media ${asset}`);
  assert.ok(html.includes("Rivindu_Kowlinda_CV.pdf"));
}
for (const group of skillGroups)
  for (const id of group.related) assert.ok(projectPaths[id]);
for (const path of ["OOP.html", "SD1.html", "SD2.html"]) {
  assert.ok(!home.includes(`href="${path}"`));
  const html = readFileSync(path, "utf8");
  assert.ok(
    html.includes("url=index.html#projects") && html.includes("noindex"),
  );
}
const bytes = readFileSync("Rivindu_Kowlinda_CV.pdf");
assert.equal(
  createHash("sha256").update(bytes).digest("hex"),
  "ee8cccc82b6fe3a4e14df9ce8d357e998ad93bcd00c4551cdd5e06a0b07af53f",
);
console.log(
  "Verified four active projects, case facts, experience, media, relationships, redirects and exact CV bytes.",
);
