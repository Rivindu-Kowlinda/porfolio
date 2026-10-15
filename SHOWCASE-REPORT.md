# Project showcase restoration — 16 October 2026

## What changed

The homepage now presents the four current projects in one sticky stage: Bug Brain Chess, AXION, 3D Interactive Portfolio and Snake Battle. The rest of the site's content and art direction remain intact.

One deterministic scroll position drives the media crossfade, vertical travel, scale, perspective, title and supporting copy, rolling project number, index progress and background colour. Titles exchange in sequence so two readable headings do not overlap. The same position produces the same frame in either scroll direction. The stage includes short settled intervals, and native scrolling continues into the next section without snapping or wheel interception.

The project index uses native smooth scrolling through that same sequence. Left/Right, Home and End work from the index; case-study links remain keyboard accessible. Only the active project's controls are interactive during the cinematic sequence. Reduced motion and short viewports present all four projects in normal document flow. The sticky presentation needs at least 650px of height on phones and 560px on wider screens.

## History investigation

The starting commit was `2514b20` (`edited projects`). It and `c593e80` rendered separate project articles with a small per-article parallax offset, not a shared pinned presentation. Older commit `c30a6b4` contains an expandable card carousel. Searching the available history did not recover the exact earlier scroll-driven version described in the request. This implementation restores the requested interaction concept using the current data; it does not restore obsolete cards or retired projects.

## Navigation and media continuity

- Homepage and case pages use the same media subtree. Navigation carries the actual elements, including the current video playback position, through the existing GSAP timeline.
- Incoming homepage geometry is prepared as a sticky stage before measuring the route destination. Both sticky chapters are frozen at their visible positions while the outgoing document transitions away.
- Returning restores the saved scroll pose. Returning after a viewport change recalculates the selected project's position for the new stage dimensions.
- Route navigation cancels an unfinished native index scroll at the selected pose. Pointer-down on a case link also stops index travel before another project can replace the link under the pointer.
- Device border widths and the stage's perspective origin interpolate with the media. The destination's inline scroll pose is restored when the carried subtree is adopted.
- Browser testing exposed horizontal centring loss when carrying Tree's playing video. The frame is now centred by its flex parent rather than relying on auto margins captured during playback.

## Tree video clipping

The recording sits inside a dedicated `.video-clip` wrapper with rounded corners, hidden overflow, isolation and a matching rounded `clip-path`. The video inherits rounding and uses `object-fit: contain`. The original 2416 × 1440 aspect ratio is preserved. The homepage and case hero share the same wrapper; the case gallery uses the same clipping primitive. Native playback controls and inline playback remain available. The recording itself is unchanged.

Poster images and upcoming project images are decoded ahead of the transition. Video metadata is prepared near the stage, playback remains user initiated, and a video pauses when its project leaves the stage. Scroll events schedule one animation frame; geometry is cached on layout changes. Page teardown disconnects observers, aborts listeners and cancels scheduled work.

## Verification

Actual rendered checks used the Codex in-app browser at 1280 × 800, 768 × 1024, 390 × 844 and an 844 × 390 short viewport.

- All four desktop and phone project states; tablet Tree composition; no horizontal overflow in inspected views.
- Forward/reverse scrolling: returning to raw position `0.4317959872159091` produced identical media opacity, title opacity and sticky position in both directions.
- All four index choices, arrow-key selection and End; natural scrolling beyond the final project into the playground.
- Case-study entry and return for all four projects, browser Back/Forward, and desktop-to-phone return to Tree.
- Tree playback in the homepage and case hero, continuity of the playing video through navigation, rounded gallery controls, and hidden-video pausing.
- Reduced-motion linear access to all four articles, keyboard case navigation, immediate navigation without shared layers, and short-screen fallback.
- No leftover route preparation/carried/outgoing layers after the checked transitions. Browser warning/error logs were empty in the final checked flow.

After the geometry fixes, the checked route handoffs had sub-pixel discontinuity. For example, the playing Tree route measured approximately 0.008px at both ends; AXION's return from a partial scroll pose measured approximately 0.041px. Typical measured JavaScript animation intervals were around 16.6–16.7ms. These are local DOM/timeline measurements, not a universal GPU or frame-rate guarantee.

`npm run check`, `npm run build` and `npm run check:build` pass. Motion checks cover reversible project poses, bounded blended visibility, non-overlapping readable titles and stage sizing, alongside the existing intro, BFS, content, CV and production-link checks.

Local screenshots and measurements are in `.qa/showcase/` (ignored by Git). Physical touchscreen devices, Safari/Firefox, OS-level preference switching and slow-network performance have not been tested. No commit, push or deployment was made.

## Source map

- `src/render-showcase.js`: shared stage generated from current project data.
- `src/showcase.js`: scroll coordinate, media preparation, index controls and lifecycle.
- `src/router.js`, `src/shared-visual.js`: route geometry and subtree transfer.
- `src/render-project.js`, `src/render-chess.js`: compatible shared media wrappers.
- `src/style.css`: stage layout, responsive adaptations and video clipping.
- `scripts/generate-projects.mjs`, `scripts/test-motion.mjs`: generation and regression checks.
