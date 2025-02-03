document.addEventListener("DOMContentLoaded", () => {
    // Reveal sections on scroll using Intersection Observer
    const sections = document.querySelectorAll(".section");
    const observerOptions = { threshold: 0.3 };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);
    sections.forEach(section => observer.observe(section));
  
    // Navbar: Apply glass effect on scroll (mobile and desktop)
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  
    // Mobile Hamburger Menu toggle
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      hamburger.classList.toggle("active");
    });
  });
  