/* Coburn Roofing — shared behaviour */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Lazy-play videos only while on screen (saves data + CPU) ---- */
  var vids = document.querySelectorAll("video[data-lazy]");
  if (vids.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (v.paused) v.play().catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---- Reviews: autoscroll slider (native swipe) + dots ---- */
  var slider = document.querySelector(".rev-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.children);
    var dotsWrap = document.querySelector(".rev-dots");
    var idx = 0, timer = null, paused = false;

    function step() { return slides.length ? slides[0].getBoundingClientRect().width + 22 : 0; }
    function perView() { return Math.max(1, Math.round(slider.clientWidth / step())); }
    function maxIdx() { return Math.max(0, slides.length - perView()); }

    if (dotsWrap && slides.length > 1) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.setAttribute("aria-label", "Go to review " + (i + 1));
        b.addEventListener("click", function () { go(i); restart(); });
        dotsWrap.appendChild(b);
      });
    }
    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];

    function markDot() {
      var cur = Math.round(slider.scrollLeft / step());
      dots.forEach(function (d, i) { d.classList.toggle("active", i === cur); });
    }
    function go(i) {
      idx = Math.min(Math.max(0, i), slides.length - 1);
      slider.scrollTo({ left: idx * step(), behavior: "smooth" });
    }
    function advance() {
      if (paused) return;
      idx = idx >= maxIdx() ? 0 : idx + 1;
      slider.scrollTo({ left: idx * step(), behavior: "smooth" });
    }
    function start() { if (slides.length > perView()) timer = setInterval(advance, 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    slider.addEventListener("scroll", function () { window.requestAnimationFrame(markDot); }, { passive: true });
    ["mouseenter", "touchstart", "pointerdown"].forEach(function (ev) {
      slider.addEventListener(ev, function () { paused = true; }, { passive: true });
    });
    ["mouseleave", "touchend"].forEach(function (ev) {
      slider.addEventListener(ev, function () { paused = false; }, { passive: true });
    });
    markDot();
    start();
    window.addEventListener("resize", function () { markDot(); });
  }

  /* ---- WhatsApp redirect form(s) ---- */
  document.querySelectorAll("form.wa-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var num = form.getAttribute("data-wa") || "";
      var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
      var lines = [
        "Hi Coburn Roofing, I'd like a quote.",
        "",
        "Name: " + get("name"),
        "Phone: " + get("phone"),
        "Area: " + get("area"),
        "Service: " + get("service"),
      ];
      var msg = get("message");
      if (msg) lines.push("Details: " + msg);
      var url = "https://wa.me/" + num + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  });

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
