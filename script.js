/* =========================================================
   DALLA GAMES 홈페이지 스크립트
   - 모바일 햄버거 메뉴 토글
   ========================================================= */

(function () {
  "use strict";

  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (!navToggle || !navMenu) return;

  // 메뉴 열기/닫기
  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  // 햄버거 버튼 클릭 → 토글
  navToggle.addEventListener("click", function () {
    var isOpen = navMenu.classList.contains("open");
    setMenu(!isOpen);
  });

  // 메뉴 항목 클릭 → 메뉴 닫기 (모바일에서 이동 후 자동 닫힘)
  navMenu.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  // ESC 키로 메뉴 닫기
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
})();
