# Rivindu Kowlinda — Engine 001

A complete cinematic rebuild of the portfolio, using Vite, vanilla JavaScript, Three.js and GSAP. All six original project URLs remain standalone, indexable HTML documents. The enhanced router connects them through one persistent WebGL renderer and animated project media.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/ . The current development server is running on this address.

```sh
npm run generate     # Regenerate the homepage and six complete case studies
npm run check        # Content/media preservation, BFS correctness and motion math
npm run build        # Regenerate pages and build dist/
npm run check:build  # Audit production links, assets, headings and portrait exclusion
npm run preview     # Serve the production build locally
npm run format      # Format the authored modules and styles
```

A separate production preview was tested at http://127.0.0.1:4173/ . Nothing has been deployed or published.

## What changed

The previous node-based scene, card layout, page styles and case-study presentation were replaced. The new identity uses porcelain, graphite and cobalt, very large typography, a custom RK mark and an original computational engine. The portrait file was removed from the working tree; no portrait is rendered, referenced in metadata or shipped in the production assets. Git history is intact.

The design study included visual inspection and interaction with landonorris.com, the Offbrand Lando case study, and Apple's homepage/product presentation. The resulting geometry, branding, layouts and code are original; their assets were not reused.

### The engine and introduction

Engine 001 is modelled procedurally rather than loaded from a stock model. Its four split superelliptic shells sit over a radial cartridge and circuit carrier. The model includes custom curved turbine vanes, instanced cooling fins, flush fasteners, engraved ticks, connector pins, circuit traces and moving signals. Standard/physical materials, an environment map, directional lighting and a soft contact shadow establish the surface and depth.

The introduction assembles those same components and moves the camera into the hero. It lasts approximately four seconds after the engine becomes available, includes a visible Skip Intro button, and runs once per tab session. There is no simulated loading percentage. Reduced motion skips the sequence, and a timeout prevents an unavailable enhancement from locking the content.

Drag the engine horizontally to rotate it. Arrow keys also rotate; Enter opens or closes the mechanism; Home and the Reset control restore the view. The interface, logic and connection selectors expose different layers and link to relevant real projects. The assembly slider overrides the scroll-driven exploded state.

The first pinned chapter continuously maps scroll position to the camera, rotation and separation. Scrolling backward reverses the same calculations. Native page scrolling is preserved. Project media also moves continuously with its viewport position.

### Navigation and project presentation

The router fetches the destination's complete static HTML and replaces only its main content. The renderer, global controls and contact dialog survive the transition. The complete project composition is carried through a persistent layer into its measured destination on one coordinated timeline. Fonts and imagery are prepared first; the WebGL pose blends without a page-swap reset. See [MOTION-REPORT.md](MOTION-REPORT.md) for the animation repair details and measurements. Browser back/forward, stored scroll positions, fragment links and direct legacy URLs are supported. A failed enhanced navigation falls back to normal browser navigation.

| Project | Original URL | Presentation |
| --- | --- | --- |
| Axion | axion.html | Layered phone mockups containing the actual Flutter screenshots |
| Ticket Manager | OOP.html | Actual application frame, architecture and original recording |
| Snake Battle | snake.html | Pathfinding composition, editable BFS experiment, game recording and code capture |
| 3D Tree Portfolio | 3d_portfolio.html | Original interactive-tree recording and procedural architecture |
| Plane Seat Manager | SD2.html | Original command-line capture and Java structure |
| Student Progress | SD1.html | Original histogram, validation rules and program captures |

Each case study retains the supplied purpose, technologies, contribution, challenge, solution, architecture, details and available original media. The recording associations were corrected against the original Git pages and the visible recordings: video1 is the 3D tree, video2 is Ticket Manager, and video3 is Snake Battle. Plane Seat Manager has screenshots but no supplied recording. The old full-stack page contained duplicated airplane-specific wording; its new description follows the CV and actual ticket-system recording. No employment, results, achievements or project-specific repository URLs were invented. The About wording describes the degree as ongoing study, not an earned qualification.

### The engineering playground

The 14 × 10 browser experiment executes breadth-first search on an editable, unweighted orthogonal grid. Visitors can toggle walls, relocate the start or target, run/pause, step through each visited node, and reset. It reports the resulting path length or the absence of a route. The grid supports arrow-key navigation and keyboard activation.

It is explicitly an illustration of the principle used in Snake Battle, not a claim to be the original Java game. The original project has a 30 × 30 board, two autonomous snakes, collision prediction and a 150 ms Swing timer.

### Contact and accessibility

The contact finale preserves the existing email, social links, downloadable CV and Formspree endpoint. The form has labelled fields, native validation, asynchronous progress/success/error feedback, and duplicate-submit prevention. The email can be copied directly.

The site uses semantic HTML, visible keyboard focus, a skip link, native modal dialogs, conventional navigation links and readable project content outside WebGL. The motion toggle persists the visitor's choice; the system reduced-motion preference is used when no override exists. Pointer handling preserves vertical touch scrolling through `touch-action: pan-y`.

If WebGL fails, a static identity graphic and the full HTML portfolio remain. Add `?graphics=off` to explicitly use this lightweight static mode. The controls in the layer inspector still explain the software concepts and link to their projects.

## Source map

- `src/content.js`: portfolio facts, projects and skill relationships.
- `scripts/generate-projects.mjs`: the common shell and homepage; generates all seven HTML documents. Edit this source rather than generated HTML.
- `src/render-project.js`: case-study templates, project-specific media and playground markup.
- `src/engine/model.js`: procedural geometry, materials, instancing and component animation.
- `src/system.js`: renderer lifetime, responsive camera, continuous scene choreography and engine interaction.
- `src/main.js`: introduction, global UI, motion preferences, page lifecycle and contact behavior.
- `src/router.js`: persistent navigation, shared media, route choreography and history.
- `src/shared-visual.js`, `src/accordion.js`, `src/dialog-motion.js`, `src/motion.js`: shared visual continuity and coordinated interaction motion.
- `src/media-dimensions.js`: intrinsic image sizes for stable lazy-loaded galleries.
- `src/pathfinder.js`: pure BFS algorithm and the experiment's state/UI.
- `src/style.css`: full visual system and desktop/tablet/phone compositions.
- `scripts/check-content.mjs`, `scripts/test-pathfinder.mjs`, `scripts/check-build.mjs`: preservation, algorithm and production audits.

## Performance choices

Three.js and the engine load dynamically. The engine uses shared materials and instanced repeated parts. Pixel ratio is capped at 1.75 on desktop and 1.35 on narrow screens, then reduced after sustained slow frames. Drawing is skipped when the engine is covered/offscreen; the animation frame loop is stopped when the document is hidden. Reduced motion renders on state changes rather than continuously drawing. Page listeners and playground timers are cleaned up on navigation; WebGL resources are disposed when leaving the document.

Images use native lazy loading where appropriate. The existing MP4 recordings have `preload="none"` and require user playback, so the roughly 48 MB of supplied recordings are not an initial-page download. Fonts are self-hosted with their licences. The production engine chunk is approximately 137 KB gzip; the main application including GSAP is approximately 36 KB gzip. These are build sizes, not measured runtime frame-rate claims.

## Verification and limits

Verified locally in the Codex browser:

- Normal intro, visible skip, immediate unlock and no replay after reloading the same session.
- Desktop and 390 × 844 mobile compositions; no horizontal overflow in the checked views.
- Pointer dragging, keyboard engine rotation, exploded state, reset, layer selection and manual assembly control.
- Scroll progression and reversal: the assembly returned to the same value at the same scroll position.
- Reduced-motion toggle and static graphics fallback.
- Project transitions, back/forward navigation and scroll restoration.
- All six direct production project URLs, plus the homepage and CV.
- Playback of all three original MP4 recordings, with no media error reported.
- BFS run/step/reset, plus unit tests for shortest paths, adjacency, unreachable targets, detours and identical endpoints.
- Contact dialog, required fields and preserved endpoint; no live message was submitted.
- Production build, all local HTML asset references and absence of portrait assets.

A physical touchscreen, the operating-system reduced-motion setting, low-end GPU performance and cross-browser compatibility have not been exhaustively tested. Responsive pointer support and OS preference handling are implemented, but there is no claimed device-lab certification or measured 60 fps guarantee. No deployment, commit or history rewrite was performed.
