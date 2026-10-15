import { projectPaths, projectVisual } from "./render-project.js";

export function renderShowcase(projects) {
  return `<section class="project-reel" data-project-reel aria-label="Selected project showcase">
    <div class="reel-sticky">
      <div class="reel-toolbar mono"><span>SELECTED WORK / SCROLL TO EXPLORE</span><div class="reel-count" aria-hidden="true"><span class="reel-current"><span class="reel-digits">${projects.map((p) => `<span>${p.number}</span>`).join("")}</span></span><span>/ ${String(projects.length).padStart(2, "0")}</span></div><a href="#playground">CONTINUE ↓</a></div>
      <div class="reel-panels">${projects
        .map(
          (
            p,
          ) => `<article id="project-${p.id}" class="project-showcase project-${p.id}${p.supporting ? " project-supporting" : ""}" data-showcase="${p.id}" aria-labelledby="project-title-${p.id}">
        <div class="project-title-row"><span class="project-number">${p.number}</span><div><span class="eyebrow">${p.kind} / ${p.year}</span><h2 id="project-title-${p.id}"><a href="${projectPaths[p.id]}">${p.title}<span aria-hidden="true">↗</span></a></h2></div></div>
        <div class="project-stage">${projectVisual(p)}</div>
        <div class="project-bottom"><p>${p.short}</p><div class="project-stack mono">${p.stack.join(" / ")}</div><a class="button" href="${projectPaths[p.id]}" aria-label="Explore ${p.title}">Explore project <span aria-hidden="true">↗</span></a></div>
      </article>`,
        )
        .join("")}</div>
      <nav class="reel-index" aria-label="Choose a project">${projects.map((p, i) => `<button type="button" data-project-select="${i}" aria-controls="project-${p.id}" aria-pressed="${i === 0}"><span class="mono">${p.number}</span><span>${p.title}</span><i aria-hidden="true"></i></button>`).join("")}</nav>
    </div>
  </section>`;
}
