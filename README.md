# Rivindu Kowlinda — Engine 001

A cinematic, portrait-free software engineering portfolio built with HTML, CSS, JavaScript, Vite, Three.js and GSAP. The existing Engine 001 art direction is retained. Four active case studies are generated as standalone HTML documents, with enhanced navigation through a persistent renderer and shared project visuals.

## Local development

```sh
npm install
npm run dev
npm run generate     # Homepage, four cases, three legacy redirects
npm run check        # Content, CV integrity, BFS and motion regression checks
npm run build        # Regenerate HTML and build dist/
npm run check:build  # Production links, media, headings, CV and portrait checks
npm run preview     # Serve dist/ locally
```

Development URL: http://127.0.0.1:5173/ . No deployment is part of this update.

## Current portfolio

| Priority | Project | URL | Presentation |
| --- | --- | --- | --- |
| 01 | Bug Brain Chess | bug-brain-chess.html | Real demonstration, technical specifications and interactive conceptual architecture |
| 02 | AXION | axion.html | Actual Flutter screens in layered phones; accurately scoped group frontend contribution |
| 03 | 3D Interactive Portfolio | 3d_portfolio.html | Earlier January–February 2025 project, explicitly distinguished from this site |
| 04 | Snake Battle | snake.html | Supporting Java/Swing/BFS project and existing recordings |

Ticket Manager, Plane Seat Management and Student Progress are removed from active data, project counts, skill relationships and engine links. OOP.html, SD2.html and SD1.html are non-indexable redirects to the current Projects section. Historical media remains in the repository; it is not featured by current pages.

The dedicated Experience section presents the July 2025–July 2026 Software Engineering Internship at hSenid Software Lanka. A scroll-driven timeline and expandable PHT/SRA descriptions cover investigation, reliability, feature development and collaboration. These are responsibility themes, not invented chronological milestones or performance claims. Education remains a separate section and menu entry.

Rivindu_Kowlinda_CV.pdf is an exact copy of the supplied latest CV. The previous CV.pdf is removed. Current download links and the production build use only the replacement. The downloadable PDF retains its original contents; private contact details are not promoted into page sections.

## Media and motion

The homepage projects share one sticky stage. Native scroll position coordinates media, copy, rolling numbering, index progress and background colour. The project index scrolls through the same reversible presentation; reduced motion and short screens expose the four articles in normal flow. Tree's recording is rounded and clipped in the showcase, case hero and gallery. See [SHOWCASE-REPORT.md](SHOWCASE-REPORT.md) for implementation details, history findings and verification.

The supplied chess recording is encoded as a 1920 × 930, 30 fps H.264 MP4, approximately 1.47 MB and 32.67 seconds. It has a real poster frame, native playback controls and inline mobile playback. On the homepage, preload="none" defers media until the demo approaches the viewport; metadata is then requested to prepare the controls. The dedicated case requests metadata immediately. It does not autoplay. The additional graph is explicitly labelled a conceptual illustration; the actual neural visualisation remains in the recording.

The introduction uses the same WebGL scene, camera and ambient clock as the homepage. Its transform is calculated as an offset from the homepage pose, so progress zero is exactly the idle pose. The first render samples the intro state, and the final state is rendered before the intro overlay is removed. See [MOTION-REPORT.md](MOTION-REPORT.md) for the actual defect, repair and measurements.

Project navigation carries the complete visual subtree into its measured destination. Images, video posters and fonts are prepared before movement. One GSAP timeline coordinates the shared visual, outgoing document and renderer. Absolute scroll is preserved at the same viewport; after a size change, return navigation restores the project's relative viewport position. Interrupted navigation, reduced motion and resized transitions settle and clean up their temporary layers.

Toolkit and Experience use native details/summary elements enhanced with one retargetable timeline per panel. Heights are measured, repeated clicks start from the current rendered height, and settled expanded panels return to height:auto. Reduced-motion timelines are assembled before playing to ensure the final height cleanup runs after every tween.

The existing engine controls, BFS experiment, contact form, keyboard access, menu and static graphics fallback remain. No live contact message was sent during this update.

## Source map

- src/content.js: active projects, facts and skill relationships.
- scripts/generate-projects.mjs: common shell, homepage and legacy redirects.
- src/render-project.js: shared case templates and supporting project visuals.
- src/render-chess.js: chess case study and shared video composition.
- src/render-experience.js: dedicated industry experience section.
- src/render-showcase.js and src/showcase.js: shared project stage and deterministic scroll choreography.
- src/chapter-motion.js: reversible chapter reveals, timeline progress and conceptual graph.
- src/system.js and src/engine/model.js: persistent WebGL engine and scene choreography.
- src/main.js: introduction, global controls, page lifecycle and contact behaviour.
- src/router.js and src/shared-visual.js: preparation, history and shared visual transitions.
- src/accordion.js, src/dialog-motion.js and src/motion.js: interaction timelines and motion math.
- src/pathfinder.js: BFS experiment.
- src/style.css: desktop, tablet and phone layouts.

Edit authored source and regenerate; generated HTML is not the source of truth.

## Verification

The current update was checked at 1280 × 720, 768 × 1024 and 390 × 844 in the Codex in-app browser. Checks included desktop/mobile intro endpoints, project entry/return, history interruption, newer navigation during transitions, responsive return restoration, accordion click reversals and keyboard activation, reduced motion, video playback, CV download and no horizontal overflow in inspected views. Browser warning/error logs were empty during the checked flow.

Automated checks cover active project relationships, retired links, source/build CV integrity, media references, generated local links, headings, portrait exclusion, BFS correctness and intro/motion math. Local evidence is under .qa/rebuild/ (ignored by Git).

Frame measurements describe JavaScript animation ticks and DOM geometry on this machine. Physical touchscreen devices, other browser engines, low-end GPUs, OS-level preference switching and live contact delivery have not been tested in this update. There is no universal 60 FPS claim.
