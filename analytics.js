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
       ※ 4개 버튼이 모두 같은 이벤트 이름을 쓰므로, 총 클릭 수는 자동으로
         합산된다. placement 는 그 합계를 쪼개 보기 위한 값일 뿐,
         합계 자체에는 영향을 주지 않는다.
     · trailer_play    — 히어로 트레일러 재생 버튼 클릭
     · faq_view        — FAQ 섹션이 실제로 화면에 보였을 때 (세션당 1회)
     · language_change — 국기 버튼으로 언어를 바꿨을 때 (from → to)
     · scroll_25 / scroll_50 / scroll_75 / scroll_100
                       — 페이지를 그만큼 내려봤을 때. 각 단계는 한 번만 보낸다.
                         이름을 나눈 이유: 파라미터로 붙이면 GA4 에 맞춤 측정기준을
                         또 등록해야 하지만, 이름이 다르면 그냥 이벤트 수로 읽힌다.

       → 모두 GA4 [보고서 > 참여도 > 이벤트] 에서 확인.
         placement 처럼 파라미터별로 나눠 보려면 [관리 > 맞춤 정의] 에서
         "맞춤 측정기준"으로 한 번 등록해 주면 된다.

   [로컬 테스트는 집계에서 제외]
     localhost / 127.0.0.1 / file:// 에서는 전송하지 않는다.
     실제 방문 통계에 개발 중 클릭이 섞이지 않게 하기 위함.
   ========================================================================= */
(function () {
  "use strict";

  /* ▼ 여기에 측정 ID 를 넣으세요 (예: "G-ABC123XYZ4") */
  var MEASUREMENT_ID = "G-T5S20FRH38";

  /* ---------- 전송할지 말지 판단 ---------- */
  var host = location.hostname;
  var isLocal =
    !host ||                       // file:// 로 연 경우
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    /^192\.168\./.test(host);      // 같은 공유기 안의 다른 기기로 테스트할 때

  /* ---------- 이 브라우저를 집계에서 빼기 ----------
     주소 뒤에 ?notrack=1 을 붙여 한 번 들어오면 그 기기는 계속 제외된다.
     해제는 ?notrack=0. 관리자 대시보드 맨 아래 체크박스로도 켜고 끌 수 있다.

     제외되면 gtag 를 아예 불러오지 않는다 — 구글로 나가는 요청 자체가 없다.
     저장소는 도메인 단위라 대시보드에서 켜도 사이트에 그대로 적용된다.

     주의: 브라우저 저장소를 지우거나 시크릿 창을 쓰면 다시 잡힌다.
     검수용 기기마다 한 번씩 열어 두면 된다. */
  var NOTRACK_KEY = "dalla-notrack";
  try {
    var wants = new URLSearchParams(location.search).get("notrack");
    if (wants === "1") localStorage.setItem(NOTRACK_KEY, "1");
    else if (wants === "0") localStorage.removeItem(NOTRACK_KEY);
  } catch (e) {}

  var excluded = false;
  try { excluded = localStorage.getItem(NOTRACK_KEY) === "1"; } catch (e) {}

  // ID 미설정 / 로컬 / 제외 지정 → 통째로 비활성
  if (!MEASUREMENT_ID || isLocal || excluded) return;

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

  /* 현재 언어: i18n.js 가 언어를 바꿀 때 <html lang> 도 함께 갱신한다 */
  function lang() { return document.documentElement.lang || "en"; }

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
      language: lang(),
      link_url: a.href
    });
  });

  /* ---------- 트레일러 재생 ---------- */
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest(".video-facade")) return;
    gtag("event", "trailer_play", { language: lang() });
  });

  /* ---------- 언어 변경 ----------
     capture 단계로 듣는다. i18n.js 의 핸들러는 버튼 자신에 달려 있어
     bubble 단계보다 먼저 실행되고, 그 안에서 <html lang> 을 새 언어로
     바꿔 버린다. bubble 로 들으면 바뀐 뒤라 from 과 to 가 항상 같아져
     이벤트가 하나도 안 나간다. capture 로 먼저 잡아야 바뀌기 전 값을 읽는다. */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest(".lang-btn");
    if (!b) return;
    var to = b.getAttribute("data-lang");
    if (!to || to === lang()) return;      // 같은 언어를 다시 누른 건 세지 않는다
    gtag("event", "language_change", { from: lang(), to: to });
  }, true);

  /* ---------- FAQ 질문 펼침 ----------
     어떤 질문을 실제로 눌러보는지. 방문자가 무엇을 궁금해하는지가 남는다.
     같은 질문을 접었다 다시 펴도 한 번만 센다 — 여닫기를 반복하면
     관심도가 아니라 만지작거린 횟수가 되어 버린다. */
  var faqOpened = {};
  document.addEventListener("click", function (ev2) {
    var b = ev2.target.closest && ev2.target.closest(".faq-q");
    if (!b) return;
    /* 모바일은 처음부터 펼쳐져 있어 "열었다"가 성립하지 않는다 */
    if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) return;
    // script.js 가 클래스를 토글하기 전이므로, 지금 닫혀 있으면 곧 열린다
    var willOpen = !b.closest(".faq-item").classList.contains("is-open");
    var id = b.getAttribute("data-faq");
    if (!willOpen || !id || faqOpened[id]) return;
    faqOpened[id] = true;
    gtag("event", "faq_open", { question: id, language: lang() });
  }, true);

  /* ---------- FAQ 열람 ----------
     FAQ 는 접었다 펴는 구조가 아니라 늘 펼쳐져 있으므로,
     "열었다"가 아니라 "실제로 화면에 보였다"를 센다.
     한 번 보면 관측을 끊어, 오르내려도 세션당 1회만 보낸다. */
  var faqEl = document.querySelector(".faq");
  if (faqEl && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      gtag("event", "faq_view", { language: lang() });
    }, { threshold: 0.25 });
    io.observe(faqEl);
  }


  /* ---------- 스크롤 깊이 ----------
     방문자가 페이지를 어디까지 내려봤는지. 25/50/75/100% 지점을 지날 때
     한 번씩만 보낸다. 어디서 이탈하는지 깔때기로 볼 수 있다.
     스크롤은 초당 수십 번 발생하므로 requestAnimationFrame 으로 묶어
     프레임당 한 번만 계산한다(스크롤이 버벅이지 않게). */
  (function trackScrollDepth() {
    var marks = [25, 50, 75, 100];
    var hit = {};                    // 이미 보낸 지점
    var ticking = false;
    var started = false;

    function measure() {
      ticking = false;
      var doc = document.documentElement;
      var total = doc.scrollHeight - window.innerHeight;

      /* 아직 잴 수 없는 상태면 아무것도 보내지 않는다.
         이 파일은 <head> 에서 실행되므로, 예전에는 <body> 가 만들어지기 전에
         높이를 재고 "스크롤할 게 없다 → 100%" 로 판단해 네 단계를 한꺼번에
         쏴 버렸다. 그래서 25/50/75/100 이 전부 같은 숫자로 나왔다. */
      if (!document.body) return;

      var pct;
      if (total > 0) {
        pct = (window.scrollY / total) * 100;
      } else if (started) {
        /* 페이지가 다 그려진 뒤에도 스크롤할 것이 없다면
           화면 하나로 끝나는 문서다 — 그때만 끝까지 본 것으로 친다. */
        pct = 100;
      } else {
        return;                      // 아직 레이아웃 전 — 판단 보류
      }

      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        if (pct >= m && !hit[m]) {
          hit[m] = true;
          gtag("event", "scroll_" + m, { language: lang() });
        }
      }
      if (hit[100]) {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    }

    /* 문서가 완전히 그려진 뒤부터 잰다. 이미지·폰트가 자리를 잡아야
       문서 높이가 실제 값이 되고, 그래야 비율이 맞는다. */
    function begin() {
      started = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      measure();                     // 열자마자 이미 보이는 만큼 먼저 집계
    }

    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin);
  })();

})();
