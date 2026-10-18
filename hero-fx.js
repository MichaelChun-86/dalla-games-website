/* =========================================================================
   히어로 오프닝 스크립트 — 홀로그램 스캐너 리빌 + 로고 글리치 (2026-10-19 개편)

   ※ head 에서 동기 로드:
      첫 페인트 전에 검정 커버(html.fx-scan-wait)를 씌워, 히어로가 미리 번쩍
      보이는 깜빡임(FOUC)을 막는다.

   하는 일
   1. 배경 영상의 첫 프레임이 준비될 때까지(최대 waitVideoMax) 기다렸다가 시작한다.
      → 스캔선이 검은 화면이 아니라 실제 게임 화면을 드러낸다.
   2. 매 프레임 스캔 위치를 계산해 커버(clip-path)와 스캔선(translateY)을 같이 움직인다.
      속도는 처음 빠르고 끝에서 살짝 느려진다(ease-out).
   3. 선이 각 요소(장르 문구 → 로고 → 출시 → 버튼 → 영상 → 캡션 → 화살표) 위를
      지나는 순간 그 요소에 .fx-in 을 붙여 바로 그 자리에서 나타나게 한다.
   4. 같은 창에서 다시 보면(새로고침·뒤로가기) 짧은 버전만 재생한다.
   5. 연출 중 클릭·스크롤·키 입력이 있으면 즉시 끝낸다.

   주소 옵션(비교·테스트용)
     ?intro=ab  전체 연출(스캔 + 로고 글리치)을 항상 재생
     ?intro=a   로고 글리치 없이 스캔만, 항상 전체 길이
     (없음)     첫 방문엔 전체, 그 뒤엔 짧은 버전

   ※ 모션 최소화(prefers-reduced-motion) 설정과 무관하게 항상 재생한다.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- 조절 값 ---------- */
  var SCAN = {
    duration: 1500,       // 전체 연출의 스캔 길이(ms)
    shortDuration: 520,   // 같은 창에서 다시 볼 때의 스캔 길이(ms)
    waitVideoMax: 1000,   // 영상 첫 프레임을 기다리는 최대 시간(ms)
    lead: 0.015,          // 선이 요소 위에 닿기 조금 전(전체 높이의 1.5%)에 등장 시작
    easePow: 1.7          // 속도 곡선: 클수록 끝에서 더 느려진다 (1 = 등속)
  };
  var SEEN_KEY = "aeon-intro-seen";
  /* 선이 지나는 순서대로 나타날 요소들 (히어로 안에서 찾는다) */
  var REVEAL = [
    ".hero-eyebrow", ".hero-hook", ".hero-title-wrap", ".hero-coming",
    ".hero-subtitle", ".steam-btn", ".hero-video", ".trailer-cap", ".scroll-down"
  ];

  var root = document.documentElement;
  root.classList.add("fx-scan-wait");   // 첫 페인트 전에 커버부터

  /* ---------- 어떤 버전을 틀지 ---------- */
  var mode = null;
  try { mode = new URLSearchParams(location.search).get("intro"); } catch (e) {}
  var seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch (e) {}
  var full = mode === "a" || mode === "ab" || !seen;   // 전체 길이로 틀지
  var glitch = full && mode !== "a";                    // 로고 글리치를 넣을지
  if (glitch) root.classList.add("fx-glitch");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    var hero = document.querySelector(".hero");
    var cover = document.querySelector(".hs-cover");
    var line = document.querySelector(".hs-line");
    if (!hero || !cover || !line) {           // 마크업이 없으면 연출 없이 바로 보여 준다
      root.classList.remove("fx-scan-wait");
      document.body.classList.add("fx-scan-done");
      return;
    }

    /* 영상 첫 프레임을 기다렸다가 시작 (너무 오래 걸리면 그냥 시작) */
    var video = document.querySelector(".hero-bg-video");
    var started = false;
    function go() {
      if (started) return;
      /* 백그라운드 탭에서 열렸으면 보일 때까지 기다린다 — 숨은 탭은 화면을 그리지 않아
         연출이 중간에 멈춘 채 남는다. 탭이 보이는 순간부터 처음부터 재생한다. */
      if (document.hidden) {
        document.addEventListener("visibilitychange", go, { once: true });
        return;
      }
      started = true;
      start(hero, cover, line);
    }
    if (video && video.readyState < 2) {       // 2 = 현재 프레임 데이터 있음
      video.addEventListener("loadeddata", go, { once: true });
      video.addEventListener("playing", go, { once: true });
      window.setTimeout(go, SCAN.waitVideoMax);
    } else {
      go();
    }
  }

  function start(hero, cover, line) {
    var body = document.body;
    var duration = full ? SCAN.duration : SCAN.shortDuration;
    var heroTop = hero.getBoundingClientRect().top + window.pageYOffset;
    var heroH = hero.offsetHeight || 1;

    /* 각 요소가 히어로 안에서 차지하는 세로 위치(0~1) — 선이 여기 닿으면 등장 */
    var items = [];
    REVEAL.forEach(function (sel) {
      hero.querySelectorAll(sel).forEach(function (el) {
        var top = el.getBoundingClientRect().top + window.pageYOffset - heroTop;
        items.push({ el: el, at: Math.max(0, Math.min(1, top / heroH)) });
      });
    });

    body.classList.add("fx-scanning");
    line.style.opacity = "1";

    var t0 = null;
    var raf = 0;
    var finished = false;

    function frame(now) {
      if (finished) return;
      if (t0 === null) t0 = now;
      var t = Math.min(1, (now - t0) / duration);
      var p = 1 - Math.pow(1 - t, SCAN.easePow);       // ease-out: 빠르게 시작, 끝에서 느려짐

      cover.style.clipPath = "inset(" + (p * 100) + "% 0 0 0)";
      line.style.transform = "translateY(" + (p * heroH) + "px)";
      if (t > 0.93) line.style.opacity = String((1 - t) / 0.07);   // 바닥에 닿으며 사라짐

      items.forEach(function (it) {
        if (!it.done && p >= it.at - SCAN.lead) {
          it.done = true;
          it.el.classList.add("fx-in");
        }
      });

      if (t < 1) raf = window.requestAnimationFrame(frame);
      else finish();
    }

    /* 건너뛰기: 연출 중 입력이 있으면 바로 끝 */
    function skip() { finish(); }
    var skipEvents = ["pointerdown", "wheel", "touchstart", "keydown"];
    skipEvents.forEach(function (ev) {
      window.addEventListener(ev, skip, { passive: true, once: true });
    });

    function finish() {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(raf);
      skipEvents.forEach(function (ev) { window.removeEventListener(ev, skip); });

      items.forEach(function (it) { it.el.classList.add("fx-in"); });
      cover.style.clipPath = "inset(100% 0 0 0)";
      line.style.opacity = "0";
      body.classList.add("fx-scan-done");       // 뒤따르는 반복 연출(빛 번짐 등) 시작
      body.classList.remove("fx-scanning");
      root.classList.remove("fx-scan-wait");    // 커버 제거
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    }

    raf = window.requestAnimationFrame(frame);
    /* 안전장치: 어떤 이유로든 프레임이 돌지 않으면(탭이 다시 숨겨지는 등)
       예정 시간의 두 배가 지난 뒤 그냥 끝낸다 — 검은 화면에 갇히지 않게 */
    window.setTimeout(finish, duration * 2 + 500);
  }
})();
