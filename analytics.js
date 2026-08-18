/* =========================================================================
   방문자 분석 (Google Analytics 4) + 스팀 위시리스트 클릭 추적

   ▼▼▼ 설정: 아래 한 줄만 바꾸면 됩니다 ▼▼▼
   GA4에서 발급받은 측정 ID(G-로 시작)를 MEASUREMENT_ID 에 넣으세요.
   비워 두면 이 파일은 아무 것도 하지 않습니다(사이트는 그대로 정상 동작).

   [측정 ID 받는 법]
     analytics.google.com → 관리 → 만들기 → 속성
     → 플랫폼 "웹" 선택 → 웹사이트 URL 에 https://dallagames.com 입력
     → 만들어진 "측정 ID" (G-XXXXXXXXXX) 를 복사

   [GA4가 자동으로 잡아주는 것 — 따로 코드 필요 없음]
     · 방문자 수, 신규/재방문, 국가·기기·브라우저
     · 유입 경로: 검색(구글/네이버), SNS, 외부 링크, 직접 방문
     · UTM 파라미터 (광고·게시물에 ?utm_source=... 를 붙였을 때)
     · 스크롤, 이탈, 체류 시간 (향상된 측정)

   [이 파일이 추가로 보내는 것]
     · wishlist_click — 스팀 위시리스트 버튼 클릭.
       placement 값으로 4개 버튼 중 어느 것이 눌렸는지 구분한다.
         hero   = 히어로 화면의 스팀 버튼
         hud    = 화면 하단 고정 바의 위시리스트 버튼
         footer = 페이지 맨 아래 스팀 아이콘
         menu   = 모바일 메뉴 안의 스팀 아이콘
       → GA4 [보고서 > 참여도 > 이벤트] 에서 확인.
         placement 별로 나눠 보려면 [관리 > 맞춤 정의] 에서
         "맞춤 측정기준"으로 placement 를 한 번 등록해 주면 된다.

   [로컬 테스트는 집계에서 제외]
     localhost / 127.0.0.1 / file:// 에서는 전송하지 않는다.
     실제 방문 통계에 개발 중 클릭이 섞이지 않게 하기 위함.
   ========================================================================= */
(function () {
  "use strict";

  /* ▼ 여기에 측정 ID 를 넣으세요 (예: "G-ABC123XYZ4") */
  var MEASUREMENT_ID = "";

  /* ---------- 전송할지 말지 판단 ---------- */
  var host = location.hostname;
  var isLocal =
    !host ||                       // file:// 로 연 경우
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    /^192\.168\./.test(host);      // 같은 공유기 안의 다른 기기로 테스트할 때

  if (!MEASUREMENT_ID || isLocal) return;   // ID 미설정이거나 로컬이면 통째로 비활성

  /* ---------- GA4 기본 스니펫 ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID);

  var s = document.createElement("script");
  s.async = true;                  // 렌더링을 막지 않는다
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(s);

  /* ---------- 스팀 위시리스트 클릭 ----------
     버튼마다 data 속성을 다는 대신, 이미 있는 클래스로 위치를 알아낸다
     (HTML 은 건드리지 않는다). 새 버튼이 생기면 아래 표에 한 줄만 추가. */
  var PLACEMENTS = [
    [".steam-btn", "hero"],        // 히어로 스팀 버튼
    [".hud-cta", "hud"],           // 하단 고정 바
    [".nav-social", "menu"],       // 모바일 메뉴 안
    [".site-footer", "footer"]     // 페이지 맨 아래
  ];

  function placementOf(el) {
    for (var i = 0; i < PLACEMENTS.length; i++) {
      if (el.closest(PLACEMENTS[i][0])) return PLACEMENTS[i][1];
    }
    return "other";
  }

  /* 클릭을 문서 전체에서 한 번만 듣는다(버튼마다 리스너를 달지 않음).
     스팀 링크는 모두 target="_blank" 라 현재 페이지가 유지되므로
     전송이 중간에 끊길 걱정이 없다. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="store.steampowered.com"]');
    if (!a) return;

    gtag("event", "wishlist_click", {
      placement: placementOf(a),
      language: document.documentElement.lang || "en",
      link_url: a.href
    });
  });
})();
