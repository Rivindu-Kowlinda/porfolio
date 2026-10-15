# Portfolio content and motion repair — 15 October 2026

This report describes the current redo against the restored repository. The existing cinematic design and shared-visual router were retained; the previous report is not treated as proof that these changes worked.

## Intro defect and repair

The actual position discontinuity was in src/system.js. The homepage assigned py = -0.08 on desktop and -0.25 on phones. While intro > 0, a later branch replaced that with py = 0.2 * intro. The intro therefore approached zero, then switched to the negative homepage value on its final frame. This produced a real transform snap.

src/motion.js now exports introPose(base, progress, mobile). Each intro transform is an offset from the sampled base pose. In particular, py = base.py + (0.2 - base.py) * progress. Progress zero returns the base pose exactly, including position, orientation, scale and camera distance. The renderer receives initialIntro before its first sampled render. Completion explicitly renders progress zero before removing the overlay. The renderer, camera and ambient clock persist.

The canvas keeps the same stacking level through intro/home. Shadow opacity follows assembly continuously, instead of appearing at a binary handoff. Neither an extra fade nor a slower intro conceals the position defect.

Measured final positive and first zero-progress frames:

| Property | Desktop, 1280 × 720 | Phone, 390 × 844 |
| --- | --- | --- |
| Last positive progress | 0.000002 | 0.000002 |
| Last positive py | -0.07999944 | -0.2499991 |
| First zero py | -0.08 | -0.25 |
| Camera z at zero | 10.4 | 10.7 |
| Scale at zero | 1 | 0.55 |
| Rotation at zero | (0.28, -0.4, -0.25) | (0.28, -0.4, -0.25) |
| Shadow opacity at zero | 0.55 | 0.55 |

The viewport/aspect and transform values remain unchanged when the introducing class is removed. The ambient clock continues. Regression tests assert zero-progress equality and continuity near zero for both responsive poses.

## Project transitions

The restored shared-element implementation already carries the actual complete visual subtree, preserves fractional geometry and runs one coordinated route timeline. It was retained and tested with the new chess composition.

This redo adds video poster decoding to the incoming document's preparation. An initial chess route showed a 136 ms interval before this change; the repeated measured desktop chess entry after preparation had a maximum interval of 22.3 ms. Preparation occurs before animation, and can be cancelled by newer navigation. A final Chromium poster check also exposed a native loading indicator while metadata was unavailable. The case now requests metadata, and the homepage requests it only as the demo approaches the viewport. Both remain paused until the visitor plays them.

A second defect surfaced during visual verification: the chapter exit reduced engine opacity, but a later showcase calculation overwrote it with a higher value. Elevating the canvas during routing could then expose the hidden engine over the project. The showcase calculation now takes the minimum of both visibility values, so it cannot revive a scene whose chapter has ended.

Home return positions also record viewport dimensions and the project's relative viewport position. Returning after responsive reflow uses the incoming project's geometry instead of an obsolete absolute scroll offset. Same-size navigation preserves the original scroll position.

## Accordions and chapter motion

Toolkit and Experience panels use one owned timeline per row, with current-height measurement, interrupted-animation retargeting, coordinated icon/content movement and height:auto after settling. Native summary activation supports Enter and Space. Closed content is inert and closing returns focus when necessary.

A reduced-motion edge case was corrected: adding zero-duration tweens to an already running timeline could complete cleanup too early, leaving a fixed panel height. Timelines are now fully assembled while paused, then played. Browser verification confirmed height:auto in reduced motion and matching panel/content heights after phone/tablet reflow.

The Experience progress ring and responsibility reveals derive continuously from scroll position. The chess graph is explicitly conceptual; its animation runs only while visible, stops in reduced motion and supports drag/arrow-key rotation. Its sticky chapter is sized to keep navigation controls visible on a 720-pixel-tall desktop viewport. Mobile uses a linear layout.

## Checks performed in this redo

- Desktop and phone intro frame audits, including the overlay-removal boundary.
- Entry and return for all four active desktop project routes.
- Phone chess and AXION entry, AXION return, and phone-to-tablet chess return.
- Intermediate screenshot sequence during the chess return transition.
- Browser Back during navigation and newer Experience navigation during an active route: no leftover busy state, inert main or transition wrappers.
- Toolkit and Experience expansion, seven/nine rapid click reversals, Enter/Space activation and reduced-motion completion.
- Open panels resized across 390/768 pixels: settled panel and content heights match.
- Desktop, tablet and phone content inspection; no horizontal overflow in inspected views.
- Actual chess MP4 playback: readyState 4, advancing time, 1920 × 930 dimensions, 32.67-second duration and no media error.
- Conceptual graph pointer/keyboard controls and numbered chapter navigation.
- Production engine Connections selection exposes the chess link and opens its case successfully, with no leftover transition layers.
- Mobile menu content and navigation, including Experience/Education and the replacement CV.
- Browser CV download, with SHA-256 equal to the supplied original. Both downloaded pages were rendered with Poppler and visually inspected. The in-app browser’s embedded PDF viewer stayed blank, so PDF readability is verified through the downloaded file rather than that viewer.
- Browser warning/error log inspection: no warnings/errors in the checked flow.
- Production preview on port 4173: all four direct case routes, all three legacy redirects, hashed chess video playback and route cleanup. The playing video continued after shared-element adoption into the homepage.

Selected route measurements, JavaScript animation intervals:

| Route | Median ms | p95 ms | Maximum ms | Start/end geometry error |
| --- | --- | --- | --- | --- |
| Desktop AXION entry | 16.7 | 19.0 | 22.6 | 0.0078 px |
| Desktop AXION return | 16.7 | 17.9 | 18.5 | 0.0078 px |
| Desktop chess entry | 16.7 | 18.9 | 22.3 | 0.0078 px |
| Phone chess entry | 16.7 | 21.0 | 24.0 | below 0.010 px |
| Chess return after tablet resize | 16.7 | 17.6 | 18.6 | 0.0078 px |
| Phone AXION entry | 16.7 | 18.8 | 19.8 | below 0.011 px |
| Phone AXION return | 16.6 | 18.5 | 18.9 | below 0.011 px |
| Final chess entry with metadata preparation, 1280 × 900 | 16.7 | 17.4 | 17.7 | 0.0078 px |

These are animation tick intervals and DOM bounding-rectangle differences on this machine, not GPU presentation timing or a device-independent frame-rate guarantee. Screenshot captures were kept separate from the timing runs where possible. Only the measured routes above carry timing claims.

## Reproduction and evidence

Use index.html?intro=1&motion-audit=1 to replay the intro with frame instrumentation. The resulting JSON is on #world[data-intro-audit]. Route instrumentation is enabled by starting with ?motion-audit=1; each completed route writes body[data-motion-audit]. Ordinary visitors do not record these arrays.

Local ignored evidence is in .qa/rebuild/: intro-desktop.json, intro-mobile.json, routes-desktop.json, routes-mobile-tablet.json, route-final-media.json, chess-return-00.png through chess-return-13.png and desktop/mobile screenshots.

Verification commands: npm run check; npm run build; npm run check:build; git diff --check.

Limitations: no physical touchscreen, other browser engines, artificial network throttling, low-end GPU profiling, OS-level preference change or live contact submission was tested. The graph is an illustration, not imported MaleCNS data. No deployment, commit or push was performed.
