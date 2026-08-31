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


  /* ============================================================
     LEAD LOGGER -> Google Sheet + email + innov8 CRM
     ============================================================
     The endpoint arrives on <body data-lead>, from BIZ.LEAD_URL in build.js.
     No URL, no listeners, no requests - the whole block is inert.

     NEVER navigator.sendBeacon here. Brave, uBlock and Firefox strict mode
     block the beacon WHILE sendBeacon() still returns true, so the common
     `if (sendBeacon(...)) return; fetch(...)` shape skips the working fetch and
     the lead vanishes with no error anywhere. fetch + keepalive:true survives
     the tab being carried off to WhatsApp just as well - that is what keepalive
     is for - and cannot report a success it did not achieve.

     text/plain is deliberate: it keeps the request CORS-simple, so there is no
     preflight for Apps Script to fail. no-cors because we never read the reply.

     NOT consent-gated, unlike analytics. It stores nothing on the device and
     sets no cookie, so PECR does not apply, and a submitted enquiry is data the
     customer chose to send. A declined cookie banner must never cost a lead.

     THE TYPE STRINGS BELOW MUST MATCH NOTIFY_TYPES IN Code.gs EXACTLY.
     A mismatch silently disables the email alert for that action. */
  var LEAD_URL = document.body.getAttribute("data-lead");

  if (LEAD_URL) {
    /* ?test=1 flags the payload so rows can be told apart. NOTE the CRM does
       NOT separate test leads - delete them from the Client Dash afterwards. */
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
        })["catch"](function () { /* never break the page */ });
      } catch (e) { /* never break the page */ }
    };
    window.sendLead = sendLead;

    /* Where on the page it happened -> the Sheet's Source column, so "3 calls
       from the bottom CTA" is answerable. Coburn's own class names. */
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

    /* Capture phase, delegated from document: a tel:/wa.me tap starts a
       navigation that can tear this document down, and a bubble-phase listener
       bound to the link itself can lose that race. */
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

    /* The quote form. Capture phase again, so this runs BEFORE the WhatsApp
       handler below preventDefaults and opens the app.

       Coburn's form has no id and no email field: it is <form class="wa-form">
       with name/phone/area/service/message read by NAME, not by id. `area` is
       Coburn-specific and Code.gs picks it up in its extras list. */
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
        source: "contact form"
      });
    }, true);
  }

  /* ============================================================
     COOKIE CONSENT AND GOOGLE ANALYTICS 4
     ============================================================
     The measurement ID arrives on <body data-ga4>, from BIZ.GA4_ID in
     build.js. No ID, no banner, no gtag, no cookies - the whole block is
     inert, which is how it stays testable and how it switches off.

     WHY THIS IS NOT THE SNIPPET GOOGLE GIVES YOU. Google's snippet is two
     <script> tags, the second inline. This site's CSP is script-src 'self'
     plus the CRM host, with NO 'unsafe-inline', so that inline block would be
     refused and analytics would silently never start - green in the editor,
     dead in production. Everything below runs from site.js, which is
     same-origin and allowed, and it appends the gtag loader itself.

     CONSENT MODE V2, DENIED BY DEFAULT. gtag.js loads on every page but is
     told up front that analytics_storage is denied, so NO COOKIE IS WRITTEN
     until somebody presses Accept. A rejected visit still sends a cookieless
     ping, which keeps headline visitor counts honest; the privacy policy says
     so plainly rather than pretending rejection means nothing leaves the page.

     wait_for_update gives the stored choice time to be read and applied before
     the first hit goes out, so an accepting returning visitor is not counted
     as a denied one on their first page.

     The choice lives in localStorage, not a cookie. Storing a cookie to record
     that you may not set cookies is the joke that writes itself, and
     localStorage is exempt on the same "strictly necessary" grounds. */
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

    /* ---- the banner ----
       Built in JS rather than shipped in every page's HTML, so a visitor who
       has already answered never receives the markup at all. Styles live in
       site.css. */
    var showBanner = function () {
      var b = document.createElement("div");
      b.className = "cc";
      b.setAttribute("role", "dialog");
      b.setAttribute("aria-label", "Cookies");
      b.innerHTML =
        '<div class="cc__in">' +
          '<p class="cc__t"><b>Cookies</b> We would like to count visits with Google Analytics, which sets a cookie. ' +
          'It is not used for advertising and you are not tracked across other websites. ' +
          'The site works exactly the same either way. <a href="' +
          (document.body.getAttribute("data-privacy") || "/privacy-policy") + '">Privacy policy</a></p>' +
          '<div class="cc__b">' +
            '<button type="button" class="cc__no">Reject</button>' +
            '<button type="button" class="cc__yes">Accept</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(b);
      document.body.classList.add("has-cc");

      /* Push the call/WhatsApp float above the banner by the banner's REAL
         height. A fixed offset is not enough: the text wraps to four lines on
         a narrow phone and one on a wide screen, so the float ends up buried.
         ResizeObserver rather than one measurement, because measuring on
         append reads the height BEFORE the webfont swaps in, and rotating a
         phone rewraps it again. */
      var lift = function () { document.body.style.setProperty("--cc-h", b.offsetHeight + "px"); };
      lift();
      var ro = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(lift); ro.observe(b); }
      else { window.addEventListener("resize", lift); }

      /* two frames: one to get it into the layout, one so the transition has a
         start value to animate from rather than snapping */
      requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add("cc--in"); }); });

      var close = function (choice) {
        writeChoice(choice);
        applyChoice(choice);
        b.classList.remove("cc--in");
        document.body.classList.remove("has-cc");
        /* let the observer go with the banner, or it keeps a detached node
           alive and keeps writing --cc-h for something that no longer exists */
        if (ro) ro.disconnect(); else window.removeEventListener("resize", lift);
        document.body.style.removeProperty("--cc-h");
        setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 350);
      };
      b.querySelector(".cc__yes").addEventListener("click", function () { close("accepted"); });
      b.querySelector(".cc__no").addEventListener("click", function () { close("rejected"); });
    };
    if (!stored) showBanner();

    /* Lets somebody change their mind: any element with data-cc-reset wipes
       the stored choice and reloads, bringing the banner back. It sits in the
       privacy policy, because burying it would defeat the point. */
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

    /* ---- events ----
       Three, matching the names used across the other client sites and the
       Apps Script lead types: click_to_call, click_whatsapp, generate_lead.
       generate_lead is one of GA4's own recommended event names, so it can be
       marked as a key event in the property with no extra setup.

       Delegated from document in the CAPTURE phase: a tel: or wa.me tap starts
       a navigation that can tear this document down, and a listener bound to
       the link itself in the bubble phase can lose that race. Delegation also
       covers links added to any page later without touching this file. */
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

    /* The quote form does not POST anywhere - it hands off to WhatsApp - so
       there is no thank-you page to count. The submit itself is the lead, and
       it counts whether or not they go on to press send in WhatsApp. */
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
