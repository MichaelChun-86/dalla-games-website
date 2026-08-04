/* =========================================================================
   터미널형 부팅 인트로 오버레이 (SECURE MODE) + 히어로 전환 애니메이션
   - 진입 시 1회 재생되는 부팅 시퀀스 → 글리치 → CRT 전원 꺼짐 전환 →
     기존 히어로 요소가 순차 페이드인.
   - 세션당 1회만 재생(sessionStorage), SKIP 버튼, 모션 최소화 선호 시 생략.
   - 기존 홈페이지 코드는 건드리지 않고, 이 스크립트가 오버레이를 동적으로
     만들어 덮었다가 제거한다. 히어로 등장은 body 클래스(.intro-playing /
     .intro-done) 기준으로 intro-overlay.css에서만 처리.
   ========================================================================= */
(function () {
  "use strict";

  var SESSION_KEY = "aeon-intro-seen";

  // 이미 이번 세션에서 봤으면 즉시 스킵(히어로 바로 표시)
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
  } catch (e) {
    /* sessionStorage 접근 불가(시크릿 등) → 그냥 1회 재생 */
  }

  // 모션 최소화 선호 시 인트로 전체 생략하고 바로 히어로(애니메이션 없이)
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
    return;
  }

  // ----- 부팅 로그 라인 정의 -----
  // text: 타이핑될 본문, highlight: 흰색 강조, cursor: 끝에 블록 커서
  var LINES = [
    { text: "BOOTING AEON SYSTEM...." },
    { text: "NOISE LEVEL: RISING...." },
    { text: "HOSTILE SWARM INBOUND...." },
    { text: "[ SIGNAL DETECTED ]....", highlight: true },
    { text: "WELCOME TO AEONFALL....", cursor: true }
  ];

  // 타이밍(ms)
  var TITLE_REVEAL_MS = 750;         // 좌상단 타이틀 페이드인 후 타이핑 시작까지
  var CHAR_DELAY = 20;               // 글자 타이핑 간격(빠르게)
  var DOT_DELAY = 95;                // 끝의 점(....)은 더 천천히 찍히게
  var LINE_GAP = 120;                // 한 줄 끝나고 다음 줄 시작까지
  var HOLD_BEFORE_TRANSITION = 200;  // 마지막 줄 후 여운
  var GLITCH_MS = 160;               // [B] 글리치 1회
  var CRT_MS = 420;                  // [A] CRT 전원 꺼짐
  var SKIP_FADE_MS = 400;            // SKIP 시 즉시 종료 페이드

  // 배경 커버(어두운 판)의 도착 불투명도.
  // 시작값 0.9 는 intro-overlay.css 의 .intro-bg-cover 에 있다.
  // 0 이 아니라 0.2 로 남겨 캐릭터가 완전히 드러나지는 않게 한다.
  var COVER_OPACITY_END = 0.2;

  // 스크롤 잠금 + 첫 페인트 전에 히어로를 숨김(FOUC 방지).
  // head에서 동기 로드되므로 <body>/.hero가 그려지기 전에 이 클래스가 적용된다.
  document.documentElement.classList.add("intro-active", "intro-playing");

  // DOM이 준비되면 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // 스크롤 잠금(intro-playing은 이미 documentElement에 적용되어 있음)
    document.body.classList.add("intro-active");

    var overlay = buildOverlay();
    document.body.appendChild(overlay);

    var consoleEl = overlay.querySelector(".intro-console-inner");
    var skipBtn = overlay.querySelector(".intro-skip");
    var uptimeEl = overlay.querySelector(".intro-uptime");

    var timers = [];
    var uptimeTimer = null;
    var finished = false;

    // ----- UPTIME 카운터: 1초마다 증가 -----
    var sec = 0;
    uptimeTimer = window.setInterval(function () {
      sec += 1;
      uptimeEl.textContent = "UPTIME: " + fmt(sec);
    }, 1000);

    // 모든 타이머/인터벌 정리(중복 재생·메모리 누수 방지)
    function clearAll() {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
      if (uptimeTimer) { clearInterval(uptimeTimer); uptimeTimer = null; }
    }

    // 오버레이 제거 + 히어로 노출(순차 페이드인은 CSS가 처리)
    function revealHero() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.documentElement.classList.remove("intro-active", "intro-playing");
      document.body.classList.remove("intro-active");
      document.body.classList.add("intro-done");
    }

    // ----- 정상 전환 시퀀스: [B]글리치 → [A]CRT 꺼짐 → 히어로 -----
    function startTransition() {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
      clearAll();

      overlay.classList.add("intro-glitch-burst");
      if (window.AeonSFX) window.AeonSFX.glitch();
      timers.push(window.setTimeout(function () {
        overlay.classList.remove("intro-glitch-burst");
        overlay.classList.add("intro-crt-off");
        // 화면 꺼질 때 "치직" 사운드
        if (window.AeonSFX) window.AeonSFX.crt();
        timers.push(window.setTimeout(revealHero, CRT_MS));
      }, GLITCH_MS));
    }

    // ----- SKIP: 즉시 종료(짧은 페이드) → 히어로 -----
    function skipIntro() {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (e) {}
      clearAll();

      overlay.classList.add("intro-hide");
      timers.push(window.setTimeout(revealHero, SKIP_FADE_MS));
    }

    skipBtn.addEventListener("click", skipIntro);
    // ESC 로도 스킵
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") {
        skipIntro();
        document.removeEventListener("keydown", onKey);
      }
    });

    // ----- 부팅 로그를 순차적으로 타이핑 (타이틀 페이드인 후 시작) -----
    // 깜빡이는 블록 커서 1개를 만들어, 현재 타이핑 중인 줄로 옮겨 다닌다.
    var cursorEl = document.createElement("span");
    cursorEl.className = "intro-cursor";

    var elapsed = TITLE_REVEAL_MS;
    LINES.forEach(function (lineData) {
      var lineEl = document.createElement("div");
      lineEl.className = "intro-line" + (lineData.highlight ? " highlight" : "");

      var prompt = document.createElement("span");
      prompt.className = "intro-prompt";
      prompt.textContent = ">";
      lineEl.appendChild(prompt);

      var textSpan = document.createElement("span");
      lineEl.appendChild(textSpan);
      consoleEl.appendChild(lineEl);

      var chars = lineData.text;

      // 줄 시작 시점에 보이게 하고, 커서를 이 줄 끝으로 이동(이전 줄에선 자동 제거)
      timers.push(
        window.setTimeout(function () {
          lineEl.classList.add("visible");
          lineEl.appendChild(cursorEl);
        }, elapsed)
      );

      // 글자 하나씩 타이핑 (점 '.'은 DOT_DELAY로 더 천천히)
      var t = elapsed;
      for (var c = 0; c < chars.length; c++) {
        t += (chars.charAt(c) === ".") ? DOT_DELAY : CHAR_DELAY;
        (function (charIndex, when) {
          timers.push(
            window.setTimeout(function () {
              var ch = chars.charAt(charIndex);
              textSpan.textContent += ch;
              // 타이핑 클릭음(공백 제외, 너무 잦지 않게 일부 글자만)
              if (window.AeonSFX && ch !== " " && Math.random() < 0.6) {
                window.AeonSFX.type();
              }
            }, when)
          );
        })(c, t);
      }

      elapsed = t;   // 줄 끝(마지막 점까지) 시점

      // 마지막 줄이 아니면 줄 간격 추가(마지막 줄엔 커서가 남아 계속 깜빡임)
      if (!lineData.cursor) {
        elapsed += LINE_GAP;
      }
    });

    // ----- 배경 커버 페이드아웃: 타이핑과 같은 구간에 걸쳐 캐릭터가 서서히 드러난다 -----
    // 타이핑 시작(TITLE_REVEAL_MS)에 맞춰 시작해, 마지막 줄이 끝나는 시점(elapsed)에
    // COVER_OPACITY_END 에 도달한다. 시작값 0.9 는 intro-overlay.css 에 있다.
    // 0.9 → 0.2 라 변화 폭이 작아 예전(1 → 0)보다 천천히 드러난다.
    // 다른 리소스(로고·로그·SKIP)의 타이밍은 건드리지 않는다.
    var coverEl = overlay.querySelector(".intro-bg-cover");
    if (coverEl) {
      var fadeDuration = Math.max(600, elapsed - TITLE_REVEAL_MS);
      timers.push(
        window.setTimeout(function () {
          coverEl.style.transition = "opacity " + fadeDuration + "ms linear";
          coverEl.style.opacity = String(COVER_OPACITY_END);
        }, TITLE_REVEAL_MS)
      );
    }

    // 마지막 줄 타이핑 완료 + 여운 후 전환 시퀀스 시작
    timers.push(window.setTimeout(startTransition, elapsed + HOLD_BEFORE_TRANSITION));
  }

  // 초 → "HH:MM:SS"
  function fmt(t) {
    return pad(Math.floor(t / 3600)) + ":" + pad(Math.floor(t / 60) % 60) + ":" + pad(t % 60);
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // ----- 오버레이 DOM 생성 -----
  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "intro-overlay";
    overlay.setAttribute("role", "presentation");
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML = [
      // 배경 이미지 2장: 아래에 캐릭터 씬(scene), 그 위에 어두운 커버(cover).
      // 타이핑이 진행되는 동안 커버의 opacity 가 1 → 0 으로 내려가며 캐릭터가 드러난다.
      '<div class="intro-bg intro-bg-scene" aria-hidden="true"></div>',
      '<div class="intro-bg intro-bg-cover" aria-hidden="true"></div>',
      // 배경 글리치: 얇은 스캔 밴드 + 가끔 어긋나는 글리치 라인 (CSS 처리, 텍스트 뒤 배경 레이어)
      '<div class="intro-glitch" aria-hidden="true"></div>',
      '<div class="intro-frame">',
      '  <span class="intro-corner tl"></span>',
      '  <span class="intro-corner tr"></span>',
      '  <span class="intro-corner bl"></span>',
      '  <span class="intro-corner br"></span>',
      '  <span class="intro-hud-label top-left">TERMINAL // BOOT MODE</span>',
      '  <span class="intro-hud-label top-right">NODE: AEON-01</span>',
      '  <span class="intro-hud-label bottom-left">SYS STATUS: ONLINE</span>',
      '  <span class="intro-hud-label bottom-right intro-uptime">UPTIME: 00:00:00</span>',
      '</div>',
      // 터미널 로고: 히어로와 같은 AeonFall 로고 + 같은 스펙큘러 스윕(반사).
      // 스윕은 style.css 의 .hero-title-wrap::after 규칙을 .intro-title 이 함께 쓴다.
      '<div class="intro-title">',
      '  <img class="intro-title-img" src="images/logo-aeonfall.webp" alt="AEONFALL" />',
      '</div>',
      // 부팅 로그: 안쪽 래퍼를 가운데 두고, 줄들은 그 안에서 왼쪽 정렬
      '<div class="intro-console"><div class="intro-console-inner"></div></div>',
      '<button type="button" class="intro-skip" aria-label="Skip intro">SKIP</button>',
      // 하단 문구: 히어로와 동일한 소개 4줄 + 카피라이트
      '<div class="intro-footer">',
      '  <p class="intro-blurb">',
      '    Dalla Games is a two-person studio built around a single, uncompromising vision.<br />',
      '    AeonFall is a hardcore roguelike defense where growth and safety are never the same choice.<br />',
      '    Every action leaves noise behind, and noise draws the infected horde.<br />',
      '    Built in Unreal Engine 5. Recipient of the Epic MegaGrant.',
      '  </p>',
      '  <p class="intro-copyright">',
      '    AeonFall&trade; <span class="copy-symbol">&copy;</span> 2026 DALLA GAMES INC. ALL RIGHTS RESERVED.',
      '  </p>',
      '</div>'
    ].join("");

    return overlay;
  }
})();
