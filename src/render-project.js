import { chessVisual, renderChess } from "./render-chess.js";
import { mediaDimensions } from "./media-dimensions.js";
export const projectPaths = {
  chess: "bug-brain-chess.html",
  axion: "axion.html",
  tree: "3d_portfolio.html",
  snake: "snake.html",
};
export function projectVisual(p, detail = false) {
  if (p.id === "chess") return chessVisual(p);
  return `<div class="project-visual">${projectMedia(p, detail)}</div>`;
}
function projectMedia(p, detail) {
  if (p.id === "axion")
    return `<div class="phone-composition"><div class="orbital-label mono">AXION / HEALTH, IN FOCUS</div><div class="phone phone-back"><img src="${p.images[1]}" width="1440" height="2983" alt="Axion medical report screen" loading="${detail ? "eager" : "lazy"}"></div><div class="phone phone-front"><img data-shared="axion" src="${p.images[0]}" width="1440" height="2983" alt="Axion personalised dashboard" loading="${detail ? "eager" : "lazy"}"></div><span class="visual-word" aria-hidden="true">Care.</span></div>`;
  if (p.id === "snake")
    return `<div class="snake-visual" aria-label="Illustration of a path through a grid"><div class="snake-trail"></div><span class="target-dot"></span><span class="visual-word">Think<br>ahead.</span><div class="mono visual-caption">BREADTH-FIRST SEARCH / JAVA + SWING</div></div>`;
  if (p.id === "tree")
    return `<div class="recording-frame"><div class="recording-window"><div class="window-label mono"><span>SPATIAL INTERFACES</span><span>THREE.JS ↗</span></div><div class="video-clip"><video data-shared="tree" controls playsinline preload="none" poster="${p.images[0]}"><source src="${p.video}" type="video/mp4"></video></div></div><span class="media-caption">Play the original 3D portfolio recording</span></div>`;
  return "";
}
export function playground() {
  return `<div class="pathfinder" data-playground><div class="playground-top mono"><span>LIVE EXPERIMENT / BFS</span><span data-counter>0 NODES VISITED</span></div><div class="path-grid" role="group" aria-label="Pathfinding grid. Use arrow keys to move between cells; Enter changes a cell."></div><div class="grid-key mono"><span><i class="start-key"></i> START</span><span><i class="goal-key"></i> TARGET</span><span><i class="wall-key"></i> WALL</span><span><i class="visited-key"></i> VISITED</span></div><div class="playground-controls"><label>Edit <select aria-label="Grid editing mode"><option value="wall">Walls</option><option value="start">Start</option><option value="goal">Target</option></select></label><button data-action="run" class="button cobalt">Run search ↗</button><button data-action="step" class="button">Step</button><button data-action="reset" class="text-button">Reset</button></div><p data-result role="status">Place obstacles. Move the target. Find a way through.</p></div>`;
}
export function renderProject(p, next) {
  if (p.id === "chess")
    return renderChess(p, projectPaths[next.id], next.title);
  return `<main id="main" class="case-main" tabindex="-1" data-case="${p.id}"><section class="case-hero project-${p.id}"><div class="case-heading"><a class="back-link mono" href="index.html#projects">↖ ALL WORK</a><div class="eyebrow"><span>PROJECT ${p.number} / ${p.kind}</span><span>${p.dates || p.year}</span></div><h1>${p.title}</h1><div class="case-intro"><p>${p.short}</p><div><p>${p.description}</p><span class="mono">${p.role}</span></div></div></div><div class="case-main-visual">${projectVisual(p, true)}</div></section><section class="case-story section-pad"><div class="case-facts"><span class="mono">THE BUILD</span><p>${p.role}</p><div class="tags">${p.stack.map((t) => `<span>${t}</span>`).join("")}</div><span class="mono">${p.dates || p.year} / ${p.kind}</span></div><div class="case-copy"><span class="eyebrow">01 / THE QUESTION</span><h2>The challenge.</h2><p>${p.challenge}</p><span class="eyebrow">02 / THE RESPONSE</span><h2>Inside the build.</h2><p>${p.solution}</p><div class="architecture" aria-label="Project architecture">${p.architecture.map((a, i) => `<div><span class="mono">0${i + 1}</span><h3>${a}</h3></div>`).join("")}</div><ul class="feature-list">${p.details.map((d) => `<li>${d}</li>`).join("")}</ul></div></section>${p.id === "snake" ? `<section class="case-lab section-pad"><div><span class="eyebrow">EXPLORE THE PRINCIPLE</span><h2>A path to<br>understanding.</h2><p>A browser experiment illustrating the BFS principle used in Snake Battle. The original game uses Java, a 30 × 30 board, two snakes and collision prediction; this editable grid isolates the search algorithm.</p></div>${playground()}</section>` : ""}<section class="case-gallery section-pad" aria-label="Original project media"><div class="eyebrow">03 / EVIDENCE IN THE DETAILS</div><h2>The original work.</h2><div class="gallery-grid ${p.id === "axion" ? "gallery-phones" : ""}">${p.images.map((src, i) => `<figure><img src="${src}" width="${mediaDimensions[src][0]}" height="${mediaDimensions[src][1]}" alt="${p.title} original project capture ${i + 1}" loading="lazy"><figcaption class="mono">${p.title} / CAPTURE 0${i + 1}</figcaption></figure>`).join("")}</div>${p.video ? `<div class="case-recording"><span class="eyebrow">PROJECT RECORDING</span><div class="video-clip"><video controls preload="none" playsinline poster="${p.images[0]}"><source src="${p.video}" type="video/mp4">Your browser cannot play this MP4 recording.</video></div></div>` : ""}</section><a class="next-project" href="${projectPaths[next.id]}"><span class="eyebrow">KEEP EXPLORING / ${next.number}</span><span>${next.title}</span><b aria-hidden="true">↗</b></a></main>`;
}
