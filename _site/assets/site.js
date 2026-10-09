
(function () {
  "use strict";

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

  var vids = document.querySelectorAll("video[data-lazy]");
  if (vids.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {

          var dp = v.getAttribute("data-poster");
          if (dp) { v.setAttribute("poster", dp); v.removeAttribute("data-poster"); }
          if (v.paused) v.play().catch(function () {});
        } else if (!v.paused) v.pause();
      });

    }, { threshold: 0.25, rootMargin: "200px 0px" });
    vids.forEach(function (v) { vio.observe(v); });
  }

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

  document.querySelectorAll("form.wa-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var num = form.getAttribute("data-wa") || "";
      var get = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
      var lines = [
        "Hi Zak, I found you on your website and I'd like a quote.",
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

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  var LEAD_URL = document.body.getAttribute("data-lead");

  if (LEAD_URL) {

    var LEAD_TEST = /[?&]test=1/.test(location.search);

    var sendLead = function (d) {
      try {
        d.page = location.pathname || "/";
        d.referrer = document.referrer || "";
        if (LEAD_TEST) d.test = true;
        fetch(LEAD_URL, {
          method: "POST",
          mode: "no-cors",
          keepalive: true,
          headers: { "Content-Type": "text/plain;charset=UTF-8" },
          body: JSON.stringify(d)
        })["catch"](function () {   });
      } catch (e) {   }
    };
    window.sendLead = sendLead;

    var leadWhere = function (el) {
      if (!el || !el.closest) return "page";
      if (el.closest(".float-cta")) return "floating button";
      if (el.closest(".nav") || el.closest(".site-header")) return "nav";
      if (el.closest(".hero-home") || el.closest(".hero")) return "hero";
      if (el.closest("form")) return "contact form";
      if (el.closest(".cta-hero")) return "bottom CTA";
      if (el.closest(".contact-grid")) return "contact details";
      if (el.closest(".site-footer")) return "footer";
      return "page";
    };

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var a = t.closest("a");
      if (!a) return;
      var h = a.getAttribute("href") || "";

      if (h.indexOf("tel:") === 0) {
        sendLead({ type: "Call click", phone: h.replace("tel:", ""), source: leadWhere(a) });
      } else if (/wa\.me|api\.whatsapp\.com|whatsapp:/i.test(h)) {
        sendLead({ type: "WhatsApp click", source: leadWhere(a) });
      } else if (h.indexOf("mailto:") === 0) {
        sendLead({ type: "Email click", details: h.replace("mailto:", "").split("?")[0], source: leadWhere(a) });
      }
    }, true);

    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!f || !f.classList || !f.classList.contains("wa-form")) return;
      var v = function (n) {
        var el = f.querySelector('[name="' + n + '"]');
        return el ? String(el.value || "").trim() : "";
      };
      sendLead({
        type: "Quote form",
        name: v("name"),
        phone: v("phone"),
        area: v("area"),
        service: v("service"),
        details: v("message"),
        botcheck: v("botcheck"),
        source: "contact form"
      });
    }, true);
  }

  var GA_KEY = "coburn_consent", GA_VER = "v1";
  var ga4 = document.body.getAttribute("data-ga4");

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  if (ga4) {
    gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      wait_for_update: 500
    });

    var readChoice = function () {
      try {
        var v = localStorage.getItem(GA_KEY);
        if (!v) return null;
        var parts = v.split(":");
        return parts[0] === GA_VER ? parts[1] : null;
      } catch (e) { return null; }
    };
    var writeChoice = function (v) {
      try { localStorage.setItem(GA_KEY, GA_VER + ":" + v); } catch (e) {}
    };
    var applyChoice = function (v) {
      gtag("consent", "update", { analytics_storage: v === "accepted" ? "granted" : "denied" });
    };

    var stored = readChoice();
    if (stored) applyChoice(stored);

    var gs = document.createElement("script");
    gs.async = true;
    gs.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ga4);
    document.head.appendChild(gs);
    gtag("js", new Date());
    gtag("config", ga4, { anonymize_ip: true });

    var showBanner = function () {
      var b = document.createElement("div");
      b.className = "cc";
      b.setAttribute("role", "dialog");
      b.setAttribute("aria-label", "Cookies");
      b.innerHTML =
        '<div class="cc__in">' +

          '<p class="cc__t"><b>Cookies</b> We would like to count visits with Google Analytics, which sets a cookie. ' +
          '<span class="cc__more">It is not used for advertising and you are not tracked across other websites. ' +
          'The site works exactly the same either way. </span><a href="' +
          (document.body.getAttribute("data-privacy") || "/privacy-policy") + '">Privacy policy</a></p>' +
          '<div class="cc__b">' +
            '<button type="button" class="cc__no">Reject</button>' +
            '<button type="button" class="cc__yes">Accept</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(b);
      document.body.classList.add("has-cc");

      var lift = function () { document.body.style.setProperty("--cc-h", b.offsetHeight + "px"); };
      lift();
      var ro = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(lift); ro.observe(b); }
      else { window.addEventListener("resize", lift); }

      requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add("cc--in"); }); });

      var close = function (choice) {
        writeChoice(choice);
        applyChoice(choice);
        b.classList.remove("cc--in");
        document.body.classList.remove("has-cc");

        if (ro) ro.disconnect(); else window.removeEventListener("resize", lift);
        document.body.style.removeProperty("--cc-h");
        setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 350);
      };
      b.querySelector(".cc__yes").addEventListener("click", function () { close("accepted"); });
      b.querySelector(".cc__no").addEventListener("click", function () { close("rejected"); });
    };
    if (!stored) showBanner();

    document.addEventListener("click", function (e) {
      var t = e.target;
      while (t && t !== document.body) {
        if (t.hasAttribute && t.hasAttribute("data-cc-reset")) {
          e.preventDefault();
          try { localStorage.removeItem(GA_KEY); } catch (err) {}
          location.reload();
          return;
        }
        t = t.parentNode;
      }
    });

    var where = function (el) {
      if (!el || !el.closest) return "page";
      if (el.closest(".float-cta")) return "floating button";
      if (el.closest(".nav")) return "nav";
      if (el.closest(".hero-home") || el.closest(".hero")) return "hero";
      if (el.closest("form")) return "contact form";
      if (el.closest(".cta-hero")) return "bottom CTA";
      if (el.closest(".contact-grid")) return "contact details";
      if (el.closest(".site-footer")) return "footer";
      return "page";
    };

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var h = a.getAttribute("href") || "";
      if (h.indexOf("tel:") === 0) {
        gtag("event", "click_to_call", { link_source: where(a), page_path: location.pathname });
      } else if (h.indexOf("wa.me") > -1) {
        gtag("event", "click_whatsapp", { link_source: where(a), page_path: location.pathname });
      }
    }, true);

    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!f || !f.classList || !f.classList.contains("wa-form")) return;
      var svc = f.querySelector('[name="service"]');
      gtag("event", "generate_lead", {
        form_id: "quote_form",
        service: svc ? svc.value : "",
        page_path: location.pathname
      });
    }, true);
  }

})();
