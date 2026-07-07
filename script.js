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
  // 페이드인 대상: OUR GAMES, ABOUT US, 푸터, 그리고 히어로의 Epic MegaGrant 박스
  // (Epic 박스는 화면에 들어올 때마다 살짝 위로 올라오며 등장해 존재감을 준다)
  var revealTargets = document.querySelectorAll(".games .section-inner, .about .section-inner, .site-footer, .epic-megagrant");

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
          // 화면에 들어오면 페이드인 (한 번만이 아니라 매번 재생)
          entry.target.classList.add("is-visible");
        } else {
          // 화면 밖으로 나가면 숨김 상태로 되돌려 다음에 다시 재생되게 함
          entry.target.classList.remove("is-visible");
          // 위쪽으로 빠져나갔으면(스크롤 내릴 때) → 다음엔 위에서 아래로 내려오며 등장
          // 아래쪽으로 빠져나갔으면(스크롤 올릴 때) → 다음엔 아래에서 위로 올라오며 등장
          if (entry.boundingClientRect.top < 0) {
            entry.target.classList.add("reveal-from-top");
          } else {
            entry.target.classList.remove("reveal-from-top");
          }
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  }
})();

/* =========================================================
   히어로 트레일러 파사드 (스팀 버튼 아래 영상)
   - 유튜브 iframe 내부(다른 도메인)에는 커스텀 커서를 적용할 수 없어서,
     재생 전에는 썸네일(게임 키아트)+재생버튼이 영역을 덮는다.
   - 클릭하면 그때 iframe 에 주소(data-src, autoplay 포함)를 넣어
     로드하고 파사드를 숨긴다. (미리 로드하지 않으니 초기 로딩도 가벼움)
   ========================================================= */
(function () {
  "use strict";

  var facade = document.getElementById("videoFacade");
  var frame = document.getElementById("trailerFrame");
  if (!facade || !frame) return;

  facade.addEventListener("click", function () {
    frame.src = frame.getAttribute("data-src");  // autoplay=1 포함 → 바로 재생
    facade.classList.add("hidden");
  });
})();
