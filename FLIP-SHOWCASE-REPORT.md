# Vertical project showcase — 19 October 2026

Implemented and checked locally against `Screen Recording 2026-10-19 at 12.22.32.mov`. This report supersedes the earlier 19 October carousel report. No commit, push or deployment was made.

## 1. Why the previous version looked like a carousel

The controller moved opaque rectangular surfaces along a sine/cosine arc through CSS perspective, with endpoint rotations of 108° on desktop and 86° on phones. The two faces were rotated ±54° at the desktop midpoint. Surface backgrounds and lighting reinforced the impression of cube faces. Separate fixed text masks cut through headings. The supplied recording shows those rotating faces and partially clipped headings.

There were no competing ScrollTriggers or wheel-remapping handlers to remove. The problematic part was the pose model, not native scrolling itself.

## 2. Replacement interaction

`src/showcase.js` now maps native scroll distance to one reversible presentation coordinate. Each outgoing visual travels upward by its stage height plus 32px while the next rises from below. Maximum outgoing/incoming tilt is 14°/8° on desktop and 8°/4° on phones. Depth and scale are restrained. There is no circular path, horizontal translation, rotateY switching, inversion, opaque plane backing, lighting layer, looping or snap.

Media stays opaque. Whole headings and supporting rows translate a few pixels with sequential opacity handoff, so two headings cannot overlap. A brief text-free handoff around the midpoint leaves attention on the moving media. Colour, numbering, tab selection and progress use the same coordinate. Native smooth tab navigation drives that same scroll position; arrow keys stop at the ends, with Home/End support.

Geometry is cached outside scroll updates. Each scroll schedules one render frame; unchanged poses skip writes. The controller preserves media nodes, preloads adjacent posters, pauses offscreen video, and cleans up observers/listeners on route changes. Reduced motion and short viewports use ordinary readable articles.

## 3. Clipping, boundaries and preference changes

The old heading slots were too short and translated text by 115% of its height. Their clipping masks are gone; title rows have enough room for the responsive headings. The media window alone clips outgoing/incoming travel, while height-aware sizing preserves complete videos at settled positions.

The sticky stage previously had desktop/phone height caps. On taller viewports that could expose the following section early. It now fills the viewport below the header, with exactly three transition intervals. The final project holds its settled pose as the stage releases into normal document scrolling. Initial project fragments are aligned after native load-time anchor scrolling.

Testing also uncovered a preference-switch jump: the universal reduced-motion rule assigned a nonzero transition duration to elements whose default transition property is `all`. This briefly animated layout dimensions and invalidated measurements. Reduced motion now uses `transition: none`; the project position is captured before earlier sections change height and restored afterward. Tree stays at approximately 64px below the phone header when toggling in either direction.

## 4. Cinematic route restoration

Git history (`c593e80`, `2514b20`) and the current code retain the shared-element pipeline in `src/router.js` and `src/shared-visual.js`. It was still connected, but the previous anchor change broke ordinary URLs without a fragment: `url.hash && ...` returned an empty string, then `anchor?.dataset.showcase` threw. The catch handler performed a full-page navigation, hiding the cinematic route.

`routeAnchor()` now returns null for missing fragments. The existing GSAP route timeline carries the actual visual subtree into its measured case hero and back. Home and case keep matching structures. Videos retain playback state. Browser history also restores the saved project coordinate after a viewport change when the source showcase was visible; it no longer relies on an obsolete absolute scroll offset. Plain links remain the fallback if enhanced navigation fails.

## 5. Browser access investigation

The earlier tool reported a protocol security rejection for the local HTTP target. The earlier run also encountered an absent development server. Neither observation proves the precise cause inside the browser tool.

For this pass, Vite was confirmed listening on `127.0.0.1:5173`, and a normal supported in-app-browser tab opened successfully. No security setting was weakened and no rejected protocol was bypassed. Browser testing was available. The route exception above was reproduced in the console before fixing it. No later warning/error was recorded during the checked flows; the original reproduced warning remains in the tab's log history.

## 6. Tests actually completed

- Desktop 1280×800: all three transitions stopped at 20%, 40%, 60% and 80% in both directions, plus endpoints. Fourteen matching forward/reverse samples had identical transforms and text opacity. Screenshots were inspected.
- Rapid scrolling across projects; rapid nonadjacent tab selection; Home/End keyboard navigation. Final selection and rendered state agreed.
- Sticky entry 100px before/at the boundary, release 100px after Snake and reverse return. At 1280×1200, the next section remained below the viewport during the final fold and reached its bottom edge at completion.
- All four case entries and browser Back returns; Forward and All Work navigation; direct Tree case loading and its return; desktop-to-phone resize followed by Back.
- 768×1024 tablet and 320×650 narrow phone: all four settled headings fit and horizontal overflow was zero; both project videos fit their media windows. 390×844 phone: project tabs, intermediate fold, video playback, routes and reduced-motion switching. 844×390 landscape: all four articles exposed with no controller transforms or hidden accessibility state.
- Reduced-motion entry/return navigation and temporary route-layer cleanup.
- Playing Tree video retained advancing time through entry and return. Chess native playback and offscreen pause were also exercised.
- `npm run check`, `npm run build`, `npm run check:build`, `git diff --check` (final results recorded after implementation).

Local evidence is in the ignored `.qa/upward-fold/` directory: forward/reverse screenshots, `scroll-samples.json`, `route-results.json`, `mobile-video-route.json`, `responsive.json`, and `resize-history.json`.

## 7. Measurements and limitations

Across the eight measured desktop entry/return routes, the largest initial/final geometry discrepancy was 0.0164px. Median animation ticks were about 16.7ms; the largest per-route p95 was 18.8ms. A repeated phone-sized playing-video route measured p95 17.6ms into the case and 17.4ms back, with maximum ticks of 20.3ms and 18.2ms.

An earlier first-play phone-sized video run had a 182.3ms maximum tick and 116.4ms p95. That spike did not reproduce in the repeated check; its precise cause is unresolved. These are JavaScript timeline intervals and DOM measurements, not GPU presentation measurements or a universal frame-rate guarantee.

Physical phones, other browser engines, low-end hardware and changing the operating-system motion preference were not tested. The site's own reduced-motion control was tested. No live contact form submission was made. Visual preference still belongs to the owner; the local preview is ready to review.

Run locally from the repository with:

```sh
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173/`. The development server was left running.
