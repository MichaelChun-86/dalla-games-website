/* =========================================================
   DALLA GAMES 홈페이지 스크립트
   - 모바일 햄버거 메뉴 토글
   - 스크롤 시 섹션 페이드인
   ========================================================= */

(function () {
  "use strict";

  /* ---------- 1. 모바일 햄버거 메뉴 ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    // 메뉴 열기/닫기
    var setMenu = function (open) {
      navMenu.classList.toggle("open", open);
      navToggle.classList.toggle("active", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    // 햄버거 버튼 클릭 → 토글
    navToggle.addEventListener("click", function () {
      setMenu(!navMenu.classList.contains("open"));
    });

    // 메뉴 항목 클릭 → 메뉴 닫기
    navMenu.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    // Home 링크 / 로고 클릭: 맨 위로 부드럽게 이동하되 주소에 #home 을 남기지 않음
    document.querySelectorAll('a.brand, .nav-link[href="#home"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        setMenu(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        // URL을 "/"(해시 없는 상태)로 정리
        history.replaceState(null, "", location.pathname + location.search);
      });
    });

    // ESC 키로 메뉴 닫기
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- 2. 스크롤 시 섹션 페이드인 ---------- */
  // 페이드인 대상: OUR GAMES, ABOUT US, 푸터
  var revealTargets = document.querySelectorAll(".games .section-inner, .about .section-inner, .site-footer");

  // 움직임 최소화 설정(접근성)을 켠 사용자는 애니메이션 없이 바로 표시
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // 지원 안 하거나 모션 최소화 → 그냥 보이게
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // 한 번만 실행
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  }
})();
