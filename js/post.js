/* ============================================================
   post.js — plaintextlab
   Floating "back to top" button for post pages. Hidden at the
   top of the page, fades in after the reader has scrolled down.
   ============================================================ */

(function () {
  var btn = document.getElementById("to-top");
  if (!btn) return;

  var SHOW_AFTER = 400; // px scrolled before the button appears
  var ticking = false;

  function update() {
    btn.classList.toggle("visible", window.scrollY > SHOW_AFTER);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener("click", function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    btn.blur();
  });

  update(); // correct state on load (e.g. page restored mid-scroll)
})();
