# Motion repair report — 15 October 2026

This pass repairs the existing Engine 001 design. It retains the six original URLs, project content, creative direction, portrait-free presentation, contact links and recordings.

## 1. What caused the broken project transition

The supplied recording reproduced several problems in `src/router.js` and `src/system.js`:

- Only the screenshot image was cloned. Its transformed bounding rectangle became a flat, fixed rectangle, losing both phone frames, their rotations and the nested perspective. The temporary image also used `object-fit: contain` while the original phone used `cover`.
- Three independent sequences ran consecutively: move the screenshot into an arbitrary intermediate rectangle, swap the page and move it again, then exit the WebGL portal. The screenshot and engine consequently spent portions of the sequence stationary.
- The fetch completed after the first movement, so a slow response could introduce another hold.
- Replacing the page called `bindPage()`, resetting the engine's base pose while the enlarged engine was still visible. The portal also forced a normally hidden engine back over the project.
- No font/image preparation established the destination's final layout before animation.
- The wider audit found fractional CSS dimensions being rounded by GSAP and a collapsing top margin on the tree recording. These caused measurable endpoint discrepancies.

## 2. How continuity now works

`src/shared-visual.js` transfers the actual complete visual tree into a persistent fixed layer. Axion keeps both phones, their frames, image fitting, transforms, transform origins and perspective. Other projects carry their entire screen, grid or recording composition.

The router prepares the incoming HTML and waits for fonts and project images to decode before beginning the shot. It prefetches route HTML on pointer intent, focus and touch. An immediate busy cursor/ARIA state acknowledges preparation. A newer navigation can cancel preparation without waiting for an unused request.

At handoff, the old document is retained as an inert visual layer. The incoming document is mounted and its actual destination geometry is measured. One 0.92-second GSAP timeline moves the full visual and reveals the new document with a coordinated clipping boundary. There is no arbitrary intermediate screenshot rectangle, image fade, second flight or post-flight engine hold.

The carried visual is adopted into the destination at the end. Fractional values are preserved with `autoRound: false`. Explicit formatting contexts prevent the recording margin from collapsing differently. The persistent WebGL renderer interpolates from its captured pose on the same timeline; it is no longer forced into an unrelated giant portal when opening a project whose engine is already offscreen.

History restoration, direct HTML routes and normal-navigation error fallback remain. Duplicate requests do not create duplicate route entries; newer requests are queued during a running shot. Back/Forward can supersede it safely. Resize and reduced-motion changes settle the active shot and clean up its temporary layers. If the source visual is outside the viewport, the route uses the document transition without manufacturing an offscreen shared element.

## 3. Toolkit accordions

`src/accordion.js` keeps the native `details`/`summary` semantics and progressive fallback. Each row has one owned timeline:

- The container animates between its current measured height and the content's natural height.
- The plus rotates smoothly and the content reveals with a small stagger.
- Closing retains the content until contraction finishes, then closes the native disclosure.
- A repeated click kills the previous timeline and retargets from the current visible height and styles.
- `ResizeObserver` updates an opening target when wrapping changes; settled open panels use `height: auto`.
- `aria-expanded`, `aria-controls`, inert closed content, native keyboard activation and focus return are maintained.
- Reduced motion completes the state change immediately.

The four rows remain independently expandable. No arbitrary maximum heights or display-property animation are used.

## 4. Other repaired motion

- Project parallax now derives from cached, untransformed layout positions. It no longer feeds its own previous transform back into the next calculation. Offscreen offsets are bounded.
- The outgoing sticky engine chapter retains its captured viewport position when moved into the fixed transition layer.
- WebGL opacity follows the scene clock directly; an extra CSS opacity transition no longer delays it.
- WebGL scroll geometry is cached and invalidated on page/size changes instead of reading multiple layout rectangles in every render frame. The engine's scroll exit blends rotation and scale continuously.
- Engine assembly takes control from the currently displayed separation. Reset blends back to automatic state, and property-specific overwrite prevents competing control tweens.
- Engine buttons, slider and layer states stay synchronized with keyboard and pointer actions. Reset also restores the button label.
- Menu and contact dialogs retain their DOM and focus trap through their closing animation. Reopening replaces the prior animation; Escape uses the same close sequence.
- Intro cleanup kills only intro-owned state. Reduced motion settles active engine and intro motion.
- Switching to reduced motion during the BFS animation now immediately finishes the current search; previously its timer continued running.
- Gallery images have intrinsic dimensions so lazy loading does not change reserved layout space.
- New shared motion constants live in `src/motion.js`. Page observers, input listeners and timers are cleaned up on navigation.

## 5. Verification performed

Tested the running development and production builds in the Codex in-app browser, including actual screenshots during animation:

| Check | Result |
| --- | --- |
| All six homepage-to-project routes and return links, desktop 1280 × 720 | Passed |
| Axion at 390 × 844, including intermediate frames | Passed; no horizontal overflow |
| Browser Back and Forward, repeated visits, restored showcase position | Passed |
| Back during a running shot; newer header navigation during a shot | Passed; no leftover overlays, inert content or busy state |
| First route visit on a separate local origin; cached repeated visits | Passed |
| Direct Axion URL reload | Passed; both images loaded, one WebGL canvas |
| Each Toolkit row opened/closed; rapid keyboard reversals; opening another row | Passed |
| Open accordions resized from 390 to 768 pixels wide | Passed; measured panel/content heights agree |
| Menu opening, animated Escape close, focus return, section navigation | Passed |
| Contact dialog opening/closing | Passed; no message submitted |
| Rapid engine explode/assemble/reset and Enter/Home controls | Passed |
| Navigation while the engine is visible, with intermediate captures | Passed; persistent canvas and continuous pose |
| Reduced-motion route/accordion changes and switching during BFS | Passed |
| BFS reset/step and algorithm/content regression suite | Passed |
| Production build and all seven documents' asset/link/heading checks | Passed |

The final desktop route matrix measured animation-tick medians of 16.6–16.7 ms, 95th percentiles of 16.9–18.5 ms and a maximum observed interval of 20.5 ms. Shared-element start/end rectangle differences were below 0.016 CSS pixels. The fresh-origin Axion pass measured 16.5 ms median, 17.6 ms at the 95th percentile, 18.1 ms maximum and a 0.008-pixel start/end discrepancy. The mobile Axion pass measured a 16.5 ms median and 18.5 ms at the 95th percentile.

These measure JavaScript animation ticks and DOM geometry on this machine, not GPU presentation timing or a universal 60 FPS guarantee. The source includes opt-in `?motion-audit=1` instrumentation; its latest result is available on `body[data-motion-audit]`. A null geometry result means there was no visible shared source, so only the document transition ran.

Commands passed:

```sh
npm run check
npm run build
npm run check:build
```

Evidence saved in `.qa/` (local, ignored by Git): `desktop-motion-results.json`, `axion-final-*.jpg`, `axion-transition-proof.jpg`, `axion-mobile-sequence.jpg`, `toolkit-expansion.jpg` and `toolkit-tablet.jpg`.

Limits: physical touchscreen hardware, other browser engines, OS-level reduced-motion switching, artificial network throttling and low-end GPU profiling were not tested. The separate-origin test exercises a first visit without the router's warmed document cache; it is not a throttled-network benchmark. Live contact delivery was not tested. No deployment or commit was made.
