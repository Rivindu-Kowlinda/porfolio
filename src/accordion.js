import { gsap } from "gsap";
import { motion } from "./motion.js";

export function mountAccordions(root, reduced) {
  const disposers = [...root.querySelectorAll(".skills-list details")].map(
    (details, index) => {
      const summary = details.querySelector("summary"),
        content = details.querySelector(".skill-detail");
      const icon = summary.querySelector("b"),
        panel = document.createElement("div");
      const items = [...content.children];
      panel.className = "accordion-panel";
      panel.id = `toolkit-panel-${index}`;
      content.replaceWith(panel);
      panel.append(content);
      summary.setAttribute("aria-controls", panel.id);
      icon.setAttribute("aria-hidden", "true");
      details.dataset.animated = "";
      let expanded = details.open,
        timeline = null,
        targetHeight = 0;
      const abort = new AbortController();
      const sync = () => {
        summary.setAttribute("aria-expanded", String(expanded));
        details.dataset.expanded = String(expanded);
        panel.inert = !expanded;
      };
      const settle = () => {
        details.open = expanded;
        panel.style.height = expanded ? "auto" : "0px";
        panel.style.overflow = expanded ? "visible" : "hidden";
        gsap.set(items, { clearProps: "opacity,transform" });
        timeline = null;
      };
      gsap.set(icon, { rotation: expanded ? 45 : 0 });
      sync();
      function animate(open) {
        const wasClosed = !details.open;
        const height = wasClosed ? 0 : panel.getBoundingClientRect().height;
        timeline?.kill();
        expanded = open;
        if (!open && panel.contains(document.activeElement))
          summary.focus({ preventScroll: true });
        sync();
        details.open = true; // Content stays mounted until the closing tween finishes.
        if (wasClosed) gsap.set(items, { opacity: 0, y: 9 });
        panel.style.height = `${height}px`;
        panel.style.overflow = "hidden";
        targetHeight = open ? content.getBoundingClientRect().height : 0;
        const duration = reduced() ? 0 : motion.accordion;
        timeline = gsap
          .timeline({ onComplete: settle, defaults: { overwrite: "auto" } })
          .to(panel, { height: targetHeight, duration, ease: motion.travel }, 0)
          .to(
            icon,
            {
              rotation: open ? 45 : 0,
              duration: duration * 0.85,
              ease: motion.travel,
            },
            0,
          )
          .to(
            items,
            {
              opacity: open ? 1 : 0,
              y: open ? 0 : -6,
              stagger: open ? duration * 0.09 : 0,
              duration: duration * (open ? 0.76 : 0.55),
              ease: motion.reveal,
            },
            open ? duration * 0.12 : 0,
          );
      }
      summary.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          animate(!expanded);
        },
        { signal: abort.signal },
      );
      const observer = new ResizeObserver(() => {
        if (
          expanded &&
          timeline &&
          Math.abs(content.getBoundingClientRect().height - targetHeight) > 0.5
        )
          animate(true);
      });
      observer.observe(content);
      addEventListener(
        "motionchange",
        () => {
          if (reduced() && timeline) timeline.progress(1);
        },
        { signal: abort.signal },
      );
      return () => {
        timeline?.kill();
        observer.disconnect();
        abort.abort();
      };
    },
  );
  return () => disposers.forEach((dispose) => dispose());
}
