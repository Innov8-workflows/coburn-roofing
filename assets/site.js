/* Coburn Roofing — shared behaviour */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
    /* close menu when a link is tapped */
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Lazy-play transformation video only while on screen (saves data + CPU) */
  var vid = document.querySelector("video[data-lazy]");
  if (vid && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (vid.paused) { vid.play().catch(function () {}); }
        } else if (!vid.paused) {
          vid.pause();
        }
      });
    }, { threshold: 0.25 });
    io.observe(vid);
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) { y.textContent = new Date().getFullYear(); }
})();
