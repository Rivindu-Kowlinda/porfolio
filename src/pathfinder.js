/** Breadth-first search on an unweighted orthogonal grid. Yielding the frontier
 * separately lets the UI step through the exact search rather than a mock path. */
export function solveGrid(width, height, start, goal, walls) {
  const queue = [start],
    visited = new Set([start]),
    parent = new Map(),
    order = [];
  let found = false;
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    order.push(node);
    if (node === goal) {
      found = true;
      break;
    }
    const x = node % width,
      y = Math.floor(node / width);
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
    ]) {
      const nx = x + dx,
        ny = y + dy,
        next = ny * width + nx;
      if (
        nx < 0 ||
        ny < 0 ||
        nx >= width ||
        ny >= height ||
        walls.has(next) ||
        visited.has(next)
      )
        continue;
      visited.add(next);
      parent.set(next, node);
      queue.push(next);
    }
  }
  const path = [];
  if (found) {
    let n = goal;
    while (n !== undefined) {
      path.push(n);
      n = parent.get(n);
    }
    path.reverse();
  }
  return { order, path, found };
}
export function mountPlayground(root, reduced) {
  const width = 14,
    height = 10,
    grid = root.querySelector(".path-grid"),
    result = root.querySelector("[data-result]"),
    counter = root.querySelector("[data-counter]");
  let start = 43,
    goal = 96,
    walls = new Set(),
    search = null,
    index = 0,
    timer = 0,
    focus = 43,
    mode = "wall";
  const defaults = [
    20, 34, 48, 62, 76, 90, 104, 107, 108, 109, 110, 66, 67, 68, 69,
  ];
  const buttons = [];
  for (let i = 0; i < width * height; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.cell = i;
    b.tabIndex = i === focus ? 0 : -1;
    b.addEventListener("click", () => edit(i));
    b.addEventListener("keydown", (e) => {
      const offsets = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowUp: -width,
        ArrowDown: width,
      };
      if (!(e.key in offsets)) return;
      e.preventDefault();
      let n = i + offsets[e.key];
      if (
        n < 0 ||
        n >= width * height ||
        (e.key === "ArrowLeft" && i % width === 0) ||
        (e.key === "ArrowRight" && i % width === width - 1)
      )
        return;
      buttons[focus].tabIndex = -1;
      focus = n;
      buttons[n].tabIndex = 0;
      buttons[n].focus();
    });
    buttons.push(b);
    grid.append(b);
  }
  function stop() {
    clearTimeout(timer);
    timer = 0;
    root.querySelector('[data-action="run"]').textContent = "Run search ↗";
  }
  function clearSearch() {
    stop();
    search = null;
    index = 0;
    counter.textContent = "0 NODES VISITED";
    paint();
  }
  function paint() {
    const visited = new Set(search?.order.slice(0, index) || []),
      path = new Set(
        search && index === search.order.length ? search.path : [],
      );
    buttons.forEach((b, i) => {
      const type =
        i === start
          ? "start"
          : i === goal
            ? "goal"
            : walls.has(i)
              ? "wall"
              : path.has(i)
                ? "path"
                : visited.has(i)
                  ? "visited"
                  : "";
      b.className = type;
      b.setAttribute(
        "aria-label",
        `Row ${Math.floor(i / width) + 1}, column ${(i % width) + 1}: ${type || "empty"}`,
      );
      b.setAttribute("aria-pressed", String(walls.has(i)));
    });
  }
  function edit(i) {
    clearSearch();
    if (mode === "wall") {
      if (i !== start && i !== goal)
        walls.has(i) ? walls.delete(i) : walls.add(i);
    } else if (mode === "start" && i !== goal) {
      start = i;
      walls.delete(i);
    } else if (mode === "goal" && i !== start) {
      goal = i;
      walls.delete(i);
    }
    paint();
    result.textContent = "Grid updated. Run or step through the new search.";
  }
  function step() {
    if (!search) search = solveGrid(width, height, start, goal, walls);
    if (index < search.order.length) index++;
    paint();
    counter.textContent = `${index} NODES VISITED`;
    if (index === search.order.length) {
      stop();
      result.textContent = search.found
        ? `Route found: ${search.path.length - 1} steps. ${index} nodes explored. Every step has equal cost.`
        : "No route exists. Remove a wall or move the target and try again.";
    } else
      result.textContent = `Exploring node ${index} of the search. The frontier expands one layer at a time.`;
  }
  function run() {
    if (timer) {
      stop();
      return;
    }
    if (search && index === search.order.length) {
      search = null;
      index = 0;
    }
    if (reduced()) {
      search = solveGrid(width, height, start, goal, walls);
      index = search.order.length - 1;
      step();
      return;
    }
    root.querySelector('[data-action="run"]').textContent = "Pause Ⅱ";
    const tick = () => {
      step();
      if (search && index < search.order.length) timer = setTimeout(tick, 35);
    };
    tick();
  }
  function reset() {
    clearSearch();
    start = 43;
    goal = 96;
    walls = new Set(defaults);
    paint();
    result.textContent =
      "Place obstacles. Move the target. Find a way through.";
  }
  root.querySelector("select").addEventListener("change", (e) => {
    mode = e.target.value;
    result.textContent = `Select a cell to ${mode === "wall" ? "toggle a wall" : `move the ${mode}`}.`;
  });
  root.querySelector('[data-action="run"]').addEventListener("click", run);
  root.querySelector('[data-action="step"]').addEventListener("click", () => {
    stop();
    step();
  });
  root.querySelector('[data-action="reset"]').addEventListener("click", reset);
  function motionChanged() {
    if (reduced() && timer && search) {
      stop();
      index = search.order.length - 1;
      step();
    }
  }
  addEventListener("motionchange", motionChanged);
  reset();
  return () => {
    stop();
    removeEventListener("motionchange", motionChanged);
  };
}
