# Rivindu Kowlinda — Engine 001

A cinematic, portrait-free software engineering portfolio built with HTML, CSS, JavaScript, Vite, Three.js and GSAP. The existing Engine 001 art direction is retained. Six active case studies are generated as standalone HTML documents, with enhanced navigation through a persistent renderer and shared project visuals.

## Local development

```sh
npm install
npm run dev
npm run generate     # Homepage, six cases, three legacy redirects
npm run check        # Content, CV integrity, BFS and motion regression checks
npm run build        # Regenerate HTML and build dist/
npm run check:build  # Production links, media, headings, CV and portrait checks
npm run preview     # Serve dist/ locally
```

Development URL: http://127.0.0.1:5173/ . No deployment is part of this update.

## Current portfolio

| Priority | Project | URL | Presentation |
| --- | --- | --- | --- |
| 01 | ECHO — Artificial Life Experiment | echo.html | Real neural-field capture, interface gallery and two playable canvas recordings |
| 02 | Bug Brain Chess | bug-brain-chess.html | Real demonstration, technical specifications and interactive conceptual architecture |
| 03 | SoundShare | soundshare.html | Acoustic image transfer, live app, screenshot and expandable demo gallery |
| 04 | AXION | axion.html | Actual Flutter screens in layered phones; accurately scoped group frontend contribution |
| 05 | 3D Interactive Portfolio | 3d_portfolio.html | Earlier January–February 2025 project, explicitly distinguished from this site |
| 06 | Snake Battle | snake.html | Supporting Java/Swing/BFS project and existing recordings |

Ticket Manager, Plane Seat Management and Student Progress are removed from active data, project counts, skill relationships and engine links. OOP.html, SD2.html and SD1.html are non-indexable redirects to the current Projects section. Historical media remains in the repository; it is not featured by current pages.

The dedicated Experience section presents the July 2025–July 2026 Software Engineering Internship at hSenid Software Lanka. A scroll-driven timeline and expandable PHT/SRA descriptions cover investigation, reliability, feature development and collaboration. These are responsibility themes, not invented chronological milestones or performance claims. Education remains a separate section and menu entry.

Rivindu_Kowlinda_CV.pdf is an exact copy of the supplied latest CV. The previous CV.pdf is removed. Current download links and the production build use only the replacement. The downloadable PDF retains its original contents; private contact details are not promoted into page sections.

## Media and motion

The homepage projects share one sticky stage. Native vertical scroll drives upward media travel with a restrained perspective fold, sequential title/copy reveals, rolling numbering, index progress and background colour. The project tabs scroll through that same reversible coordinate. Reduced motion and short screens expose six articles in normal flow. Tree's recording retains its rounded clipping in the showcase, case hero and gallery. See [FLIP-SHOWCASE-REPORT.md](FLIP-SHOWCASE-REPORT.md) for the 19 October replacement, route fixes and actual browser verification. [SHOWCASE-REPORT.md](SHOWCASE-REPORT.md) records the earlier implementation and its historical checks.

The supplied chess recording is encoded as a 1920 × 930, 30 fps H.264 MP4, approximately 1.47 MB and 32.67 seconds. It has a real poster frame, native playback controls and inline mobile playback. On the homepage, preload="none" defers media until the demo approaches the viewport; metadata is then requested to prepare the controls. The dedicated case requests metadata immediately. It does not autoplay. The additional graph is explicitly labelled a conceptual illustration; the actual neural visualisation remains in the recording.

The introduction uses the same WebGL scene, camera and ambient clock as the homepage. Its transform is calculated as an offset from the homepage pose, so progress zero is exactly the idle pose. The first render samples the intro state, and the final state is rendered before the intro overlay is removed. See [MOTION-REPORT.md](MOTION-REPORT.md) for the actual defect, repair and measurements.

Project navigation carries the complete visual subtree into its measured destination. Images, video posters and fonts are prepared before movement. One GSAP timeline coordinates the shared visual, outgoing document and renderer. Absolute scroll is preserved at the same viewport; after a size change, return navigation restores the project's relative viewport position. Interrupted navigation, reduced motion and resized transitions settle and clean up their temporary layers.

Toolkit and Experience use native details/summary elements enhanced with one retargetable timeline per panel. Heights are measured, repeated clicks start from the current rendered height, and settled expanded panels return to height:auto. Reduced-motion timelines are assembled before playing to ensure the final height cleanup runs after every tween.

The existing engine controls, BFS experiment, contact form, keyboard access, menu and static graphics fallback remain. No live contact message was sent during this update.

## ECHO media and content

ECHO is first in `src/content.js`, followed by the previous five projects in their existing relative order. The short display title is used in the showcase; the full title remains in page metadata, with “Artificial Life Experiment” in the case introduction. Its card and shared case hero use the supplied brain poster so the existing visual transition retains the same image. The Neural Lab and Observatory are full-width gallery captures; the two other application screenshots and the two individual canvas recordings follow them. The optional combined showreel is omitted to avoid repeating the same recordings.

All ECHO content and media paths live in its project entry. The eight copied assets match the kit’s SHA-256 hashes, retained in `docs/echo-assets.json`. Videos have matching posters, native controls and inline playback. Metadata loads near the gallery; playback starts only on request, including under reduced motion. Starting another gallery clip pauses the first. No demo or repository button is emitted because neither public URL was supplied.

The technical facts and original project verification methods come from the supplied 23 November 2026 kit. Portfolio checks verify their integration; they do not rerun ECHO’s simulation tests. Population counts shown in the captures describe one run, and the 20 Hz world / up-to-10 Hz snapshot stream are not browser rendering benchmarks.

Verified on 24 November 2026 in the in-app browser: first position and six-project order, desktop (1280×800) and phone (390×844 / 320×700) layouts, native video play/pause/scrub and keyboard playback, one-at-a-time demo playback, reduced-motion document flow, and card/detail/Back transitions. Measured shared-visual alignment differences stayed below 0.01px on desktop and phone. Local screenshots and transition measurements are in `.qa/echo/` (ignored by Git). These checks cover the portfolio in this browser, not ECHO’s own runtime or physical devices.

## SoundShare media

SoundShare is authored in `src/content.js` with the other projects. Its `media` array keeps four entries together: `primary`, `additional`, `sending`, and `receiving`. The primary image supplies the homepage thumbnail and appears once in the case hero. The screenshot is preserved in full with contained sizing.

To add media, place the files under `images/` or `videos/`, set the corresponding entry's `src` to its repository-relative path, and run `npm run generate` (also run automatically before `npm run build`). Each image has editable `alt` and optional `caption` fields; width/height can optionally reserve its intrinsic space. Each video has a title, optional `poster` path and optional caption. Empty sources display placeholders. Filling a video source enables native controls in place, with no autoplay or muting. The second image's coming-soon caption disappears when its source is filled.

`liveUrl` points to the public SoundShare app; `sourceUrl` remains empty while the repository is private. The stated 17 tests and exact-byte offline recovery describe SoundShare verification supplied by the project owner, not tests executed against SoundShare during this portfolio edit.

The showcase derives its colour stops and tab count from project data. SoundShare has space for its longer card description; the existing projects retain their layout. Local browser evidence for this addition lives in `.qa/soundshare/` and is ignored by Git. The temporary media fixture uses an existing chess clip solely to check future video activation; it is not part of the production build.

Verified on 23 November 2026: desktop and phone card/detail/gallery layouts, the public live-app destination, five-tab keyboard navigation, the Snake → SoundShare fold and reverse, shared-element entry/Back on desktop and phone, reduced motion, and path-only native video activation with play/pause/scrub. Tablet and narrow-phone card layouts were also inspected. The measured route handoff discrepancy stayed below 0.01px in the final desktop and phone checks. Browser warning/error logs were empty. These are in-app browser checks, not physical-device or cross-browser certification.

## Source map

- src/content.js: active projects, facts and skill relationships.
- scripts/generate-projects.mjs: common shell, homepage and legacy redirects.
- src/render-project.js: shared case templates and supporting project visuals.
- src/render-media.js: optional image and native-video slots, including empty states.
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

The 19 October vertical-fold update was checked in the in-app browser at desktop, tablet, phone, narrow-phone, tall-screen and short-landscape sizes. Tests covered stopped forward/reverse poses, rapid scrolling and tabs, sticky entry/exit, all four shared-element case routes, history, responsive return restoration, direct Tree entry, reduced motion and video playback. The missing-fragment route exception was reproduced and fixed; no subsequent warning/error appeared in the checked flows. Content, motion math and production checks pass. Full measurements and limitations are in FLIP-SHOWCASE-REPORT.md; local evidence is in .qa/upward-fold/ (ignored by Git).

The earlier portfolio content update was checked at 1280 × 720, 768 × 1024 and 390 × 844 in the Codex in-app browser. Checks included desktop/mobile intro endpoints, project entry/return, history interruption, newer navigation during transitions, responsive return restoration, accordion click reversals and keyboard activation, reduced motion, video playback, CV download and no horizontal overflow in inspected views. Browser warning/error logs were empty during that earlier checked flow.

Automated checks cover active project relationships, retired links, source/build CV integrity, media references, generated local links, headings, portrait exclusion, BFS correctness and intro/motion math. Local evidence is under .qa/rebuild/ (ignored by Git).

Frame measurements describe JavaScript animation ticks and DOM geometry on this machine. Physical touchscreen devices, other browser engines, low-end GPUs, OS-level preference switching and live contact delivery have not been tested in this update. There is no universal 60 FPS claim.
