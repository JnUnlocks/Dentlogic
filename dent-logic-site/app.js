/* Dent Logic Inc — progressive enhancement only.
   The page works with JS disabled: the form does a native POST to Netlify,
   and every phone/email link is a plain anchor. */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Mobile menu ---- */
  var menuBtn = document.querySelector(".menu-btn");
  var drawer = document.getElementById("drawer");
  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        drawer.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Before/after sliders ----
     A range input sits invisibly over the stage, so drag, tap, and arrow keys
     all work for free and it stays reachable by keyboard and screen readers. */
  document.querySelectorAll(".ba__stage").forEach(function (stage) {
    var range = stage.querySelector(".ba__range");
    if (!range) return;
    var paint = function () {
      stage.style.setProperty("--pos", range.value + "%");
    };
    range.addEventListener("input", paint);
    paint();
  });

  /* ---- Record which page produced the lead ---- */
  var src = document.getElementById("lead-source");
  if (src) src.value = document.title + " — " + location.pathname;

  /* ---- Prefilled text-message link ----
     iOS wants sms:NUMBER&body=…, everything else wants ?body=…  */
  var PHONE = "+16103167761";
  var body =
    "Hi Dent Logic - I'd like a PDR estimate.\n" +
    "Vehicle (year/make/model):\n" +
    "Dent location:\n" +
    "My ZIP:\n" +
    "(sending photos next)";
  var sep = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) ? "&" : "?";
  document.querySelectorAll("[data-sms-prefill]").forEach(function (a) {
    a.setAttribute("href", "sms:" + PHONE + sep + "body=" + encodeURIComponent(body));
  });

  /* ---- Form: friendly client-side checks before the native POST ---- */
  var form = document.getElementById("estimate-form");
  if (!form) return;
  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    var phone = form.querySelector("#phone");
    var email = form.querySelector("#email");
    if (!phone.value.trim() && !email.value.trim()) {
      e.preventDefault();
      if (status) {
        status.textContent = "Add a phone number or an email so Greg can send your estimate back.";
        status.style.color = "#c02616";
      }
      phone.focus();
      return;
    }
    var btn = form.querySelector("button[type=submit]");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending…";
    }
  });
})();
