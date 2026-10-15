import { gsap } from "gsap";
import { motion } from "./motion.js";

export function animateDialog(dialog, reduced, onState = () => {}) {
  let timeline,
    closing = false;
  const links = [...dialog.querySelectorAll("nav a")];
  const clear = () =>
    gsap.set([dialog, ...links], { clearProps: "opacity,transform" });
  function close(immediate = false) {
    if (!dialog.open) return;
    timeline?.kill();
    closing = true;
    onState(false);
    const finish = () => {
      dialog.close();
      clear();
      closing = false;
    };
    if (immediate || reduced()) return finish();
    timeline = gsap.timeline({ onComplete: finish }).to(dialog, {
      opacity: 0,
      y: -12,
      duration: motion.micro,
      ease: motion.travel,
    });
  }
  function open() {
    timeline?.kill();
    const fresh = !dialog.open;
    closing = false;
    if (fresh) dialog.showModal();
    onState(true);
    if (reduced()) {
      clear();
      return;
    }
    if (fresh) {
      gsap.set(dialog, { opacity: 0, y: 16 });
      gsap.set(links, { opacity: 0, y: 18 });
    }
    timeline = gsap
      .timeline({ onComplete: clear })
      .to(
        dialog,
        { opacity: 1, y: 0, duration: motion.dialog, ease: motion.reveal },
        0,
      );
    if (links.length)
      timeline.to(
        links,
        {
          opacity: 1,
          y: 0,
          duration: motion.dialog,
          stagger: 0.035,
          ease: motion.reveal,
        },
        0.04,
      );
  }
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  addEventListener("motionchange", () => {
    if (reduced()) {
      timeline?.kill();
      if (closing) close(true);
      else clear();
    }
  });
  return { open, close };
}
