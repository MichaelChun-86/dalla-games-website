/* =========================================================================
   프레스킷 섹션: 영문 / 한글 전환
   - 처음 열 때는 사이트 언어를 따른다: 한국어면 한글판, 그 외(영/중/일)는 영문판.
   - 사이트 언어를 바꾸면(i18n.js 가 <html lang> 을 바꿈) 프레스킷도 따라 바뀐다.
   - 섹션 안의 EN / KO 버튼으로 직접 고를 수도 있다(사이트 언어는 그대로).
   - 새 디자인으로 바꾸려면 아래 DECKS 의 주소만 고치면 된다.
   ========================================================================= */
(function () {
  "use strict";

  var DECKS = {
    en: {
      view: "https://www.canva.com/design/DAHaEAFaDok/GoHfrveLz-ZiZrDf_n-Tiw/view",
      pdf: "presskit/AeonFall_PressKit_EN.pdf"
    },
    ko: {
      view: "https://www.canva.com/design/DAHZ8hdcasU/Te8sUcQbZo8OWRFMn8jmHA/view",
      pdf: "presskit/AeonFall_PressKit_KO.pdf"
    }
  };

  var viewer = document.getElementById("pkViewer");
  var openBtn = document.getElementById("pkOpen");
  var pdfBtn = document.getElementById("pkPdf");
  var langBtns = document.querySelectorAll(".pk-lang");
  if (!viewer || !openBtn || !pdfBtn) return;

  var current = null;

  function show(key) {
    if (!DECKS[key] || key === current) return;
    current = key;
    var d = DECKS[key];
    viewer.src = d.view + "?embed";   // Canva 공식 임베드 주소
    openBtn.href = d.view;
    pdfBtn.href = d.pdf;
    langBtns.forEach(function (b) {
      var on = b.getAttribute("data-deck") === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // 사이트 언어 → 프레스킷 언어
  function fromSiteLang() {
    return document.documentElement.getAttribute("lang") === "ko" ? "ko" : "en";
  }

  langBtns.forEach(function (b) {
    b.addEventListener("click", function () { show(b.getAttribute("data-deck")); });
  });

  // 사이트 언어가 바뀌면 따라간다
  new MutationObserver(function () { show(fromSiteLang()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  show(fromSiteLang());
})();
