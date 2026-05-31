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
    { text: "WELCOME TO THE AEON FALL....", cursor: true }
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

  // 스크롤 잠금
  document.documentElement.classList.add("intro-active");

  // DOM이 준비되면 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // intro-playing: 인트로 재생 중 히어로 주요 요소를 숨김 상태로 둠
    document.body.classList.add("intro-active", "intro-playing");

    var overlay = buildOverlay();
    document.body.appendChild(overlay);

    var consoleEl = overlay.querySelector(".intro-console");
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
      document.documentElement.classList.remove("intro-active");
      document.body.classList.remove("intro-active", "intro-playing");
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
      '<div class="intro-frame">',
      '  <span class="intro-corner tl"></span>',
      '  <span class="intro-corner tr"></span>',
      '  <span class="intro-corner bl"></span>',
      '  <span class="intro-corner br"></span>',
      '  <span class="intro-hud-label top-left">AEON SYSTEMS v7.3.2</span>',
      '  <span class="intro-hud-label top-right">TERMINAL // SECURE MODE</span>',
      '  <span class="intro-hud-label bottom-left">SYS STATUS: ONLINE</span>',
      '  <span class="intro-hud-label bottom-right intro-uptime">UPTIME: 00:00:00</span>',
      '</div>',
      '<img class="intro-title" src="images/logo-aeonfall.webp" alt="THE AEON FALL" />',
      '<div class="intro-console"></div>',
      '<button type="button" class="intro-skip" aria-label="Skip intro">SKIP</button>'
    ].join("");

    return overlay;
  }
})();
