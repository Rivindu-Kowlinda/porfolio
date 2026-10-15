import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { projects, profile, skillGroups } from "../src/content.js";
import { projectPaths } from "../src/render-project.js";
assert.equal(projects.length, 6, "All six original projects must be retained");
assert.equal(new Set(projects.map((p) => p.id)).size, projects.length);
for (const project of projects) {
  const path = projectPaths[project.id];
  assert.ok(existsSync(path), `Missing original project URL: ${path}`);
  const html = readFileSync(path, "utf8");
  for (const text of [
    project.title,
    project.challenge,
    project.solution,
    ...project.details,
  ])
    assert.ok(
      html.replace(/\s+/g, " ").includes(text.replace(/\s+/g, " ")),
      `Missing case-study content: ${path}`,
    );
  for (const asset of [
    ...project.images,
    ...(project.video ? [project.video] : []),
  ])
    assert.ok(existsSync(asset), `Missing original asset: ${asset}`);
  assert.ok(
    /<main\b[^>]*\bid="main"/s.test(html),
    `Missing semantic main: ${path}`,
  );
}
for (const group of skillGroups)
  for (const id of group.related)
    assert.ok(projectPaths[id], `Unknown project relationship: ${id}`);
assert.ok(existsSync("CV.pdf"));
assert.ok(readFileSync("index.html", "utf8").includes(profile.email));
console.log(
  "Content verified: six original routes, all case studies, project relationships, media, CV and contact email.",
);

assert.equal(
  projects.find((p) => p.id === "ticket").video,
  "videos/video2.mp4",
);
assert.equal(projects.find((p) => p.id === "snake").video, "videos/video3.mp4");
assert.equal(projects.find((p) => p.id === "tree").video, "videos/video1.mp4");
assert.equal(projects.find((p) => p.id === "plane").video, undefined);
