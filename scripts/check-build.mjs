import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { projects } from "../src/content.js";
import { projectPaths } from "../src/render-project.js";
const root = resolve("dist");
for (const file of ["index.html", ...Object.values(projectPaths)]) {
  const html = readFileSync(join(root, file), "utf8");
  assert.equal(
    (html.match(/<main\b/g) || []).length,
    1,
    `${file}: one semantic main`,
  );
  assert.equal(
    (html.match(/<h1\b/g) || []).length,
    1,
    `${file}: one primary heading`,
  );
  assert.ok(
    !/profile\.jpg|signature\.png/i.test(html),
    `${file}: no personal image references`,
  );
  for (const [, url] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|#|data:)/.test(url)) continue;
    const path = url.split("#")[0].split("?")[0];
    if (!path) continue;
    assert.ok(
      existsSync(resolve(dirname(join(root, file)), path)),
      `${file}: missing ${url}`,
    );
  }
}
const assets = readdirSync(join(root, "assets"));
assert.ok(
  !assets.some((f) => /profile|portrait|signature/i.test(f)),
  "No personal image asset in build",
);
for (const p of projects) {
  const html = readFileSync(join(root, projectPaths[p.id]), "utf8");
  assert.ok(html.includes(p.title));
  assert.ok(
    html.includes(p.id === "chess" ? "Built to" : "The original work."),
  );
}
console.log(
  "Production audit passed: all active documents, local links/media, semantic headings and portrait-free assets.",
);

for (const file of ["OOP.html", "SD1.html", "SD2.html"])
  assert.ok(
    readFileSync(join(root, file), "utf8").includes("index.html#projects"),
  );
assert.ok(existsSync(join(root, "Rivindu_Kowlinda_CV.pdf")));
assert.ok(!existsSync(join(root, "CV.pdf")));
assert.deepEqual(
  readFileSync(join(root, "Rivindu_Kowlinda_CV.pdf")),
  readFileSync("Rivindu_Kowlinda_CV.pdf"),
);
