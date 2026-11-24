import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { projects } from "../src/content.js";
import { renderProject } from "../src/render-project.js";
import { renderMediaSlot } from "../src/render-media.js";

const project = projects.find((p) => p.id === "soundshare");
const empty = renderProject(project, projects[0]);
assert.deepEqual(
  project.media.map((m) => m.type),
  ["image", "image", "video", "video"],
);
assert.equal(
  (empty.match(/<img\b/g) || []).length,
  1,
  "Primary image must appear once",
);
assert.equal(
  (empty.match(/<video\b/g) || []).length,
  0,
  "Empty slots cannot expose players",
);
assert.equal((empty.match(/Demo coming soon/g) || []).length, 2);
assert.ok(empty.includes("Additional project image coming soon."));
assert.ok(empty.includes('href="https://soundshare-one.vercel.app"'));
assert.ok(!empty.includes("Source code"));
assert.ok(!empty.includes('src=""'));

// Exercise the promised future-edit workflow: paths alone activate all slots.
const populated = structuredClone(project);
populated.media[1].src = "images/future-capture.png";
populated.media[2].src = "videos/sending.webm";
populated.media[3].src = "videos/receiving.mp4";
populated.media[3].poster = "images/receiving-poster.png";
const ready = renderProject(populated, projects[0]);
assert.equal((ready.match(/<img\b/g) || []).length, 2);
assert.equal((ready.match(/<video\b/g) || []).length, 2);
assert.ok(!ready.includes("Demo coming soon"));
assert.ok(!ready.includes("Additional project image coming soon."));
for (const tag of ready.match(/<video\b[^>]*>/g)) {
  assert.ok(tag.includes("controls") && tag.includes("playsinline"));
  assert.ok(tag.includes('preload="none"'));
  assert.ok(
    !/autoplay|\bmuted\b|controlslist|disablepictureinpicture/i.test(tag),
  );
}
assert.ok(ready.includes('poster="images/receiving-poster.png"'));
const optional = renderMediaSlot({
  type: "image",
  id: "additional",
  src: "images/test.png",
  alt: 'An image with "quotes"',
  caption: "",
});
assert.ok(optional.includes('alt="An image with &quot;quotes&quot;"'));
assert.ok(!optional.includes("figcaption"));
console.log(
  "SoundShare media verified: one primary image, honest empty slots, path-only activation, optional posters/captions and user-initiated native video controls.",
);

const echo = projects.find((p) => p.id === "echo");
const echoPage = renderProject(echo, projects[1]);
assert.equal((echoPage.match(/<img\b/g) || []).length, 5);
assert.equal((echoPage.match(/<video\b/g) || []).length, 2);
assert.ok(!echoPage.includes("echo-showreel"));
assert.ok(
  !echoPage.includes("Source code") && !echoPage.includes("project-live-link"),
);
assert.ok(!echoPage.includes("127.0.0.1"));
for (const tag of echoPage.match(/<video\b[^>]*>/g)) {
  assert.ok(tag.includes("controls") && tag.includes("playsinline"));
  assert.ok(tag.includes('poster="images/echo-'));
  assert.ok(!/autoplay|\bloop\b/.test(tag));
}
for (const asset of JSON.parse(readFileSync("docs/echo-assets.json", "utf8"))
  .assets) {
  const bytes = readFileSync(asset.path);
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
}
console.log(
  "ECHO media verified: original capture hashes, four interface images, two finite user-initiated clips and no invented public links.",
);
