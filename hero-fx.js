/* =========================================================================
   히어로 특수효과 스크립트 (기존 코드와 분리된 추가 파일)
   ① 글리치 / RGB 스플릿 버스트 — 스캔 직후 1회 + 이후 랜덤 간격(GLITCH 설정), 0.2~0.4초씩
   ② 로드 시 스캐너 스윕 리빌 — 매 로드마다 1회

   ※ head 에서 동기 로드:
      첫 페인트 전에 스캔 커버를 씌워, 히어로가 미리 번쩍 보이는
      깜빡임(FOUC)을 막는다.

   [테스트 방법]
   - 글리치 즉시 발동:   개발자도구 콘솔에서  HeroFX.burst()
   - 글리치 빈도 높이기: HeroFX.config.minInterval = 1000;
                         HeroFX.config.maxInterval = 2000;
                         (다음 스케줄부터 적용. 원래대로는 새로고침)
   - 스캔 다시 보기:     새로고침(F5). 매 로드마다 실행된다.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- ① 글리치 버스트 설정 (빈도·지속시간) ----------
     강도(어긋남 폭·투명도)는 hero-fx.css 상단의 --hg-* 변수에서 조절 */
  var GLITCH = {
    enabled: true,
    firstDelay: 350,     // 스캔 리빌 종료 후 첫 버스트까지(ms) — 바로 인지되도록 짧게
    minInterval: 4000,   // 다음 버스트까지 최소 대기(ms)
    maxInterval: 9000,   // 다음 버스트까지 최대 대기(ms)
    minDuration: 200,    // 버스트 1회 최소 길이(ms)
    maxDuration: 400     // 버스트 1회 최대 길이(ms)
  };

  /* ---------- ② 스캐너 스윕 설정 ---------- */
  var SCAN = {
    enabled: true,
    duration: 1400,      // 스캔 전체 길이(ms) — 1200~1800 권장
    holdAfter: 80        // 스캔이 끝나고 텍스트 등장까지 짧은 여유(ms)
  };

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var glitchTimer = null;
  var bursting = false;

  // 새로고침 FOUC 방지: 첫 페인트 전에 검정 커버부터 씌운다(head 동기 실행)
  if (SCAN.enabled && !reduceMotion) {
    root.classList.add("fx-scan-wait");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // 스캔 길이의 단일 소스는 이 파일의 SCAN.duration → CSS 변수로 전달
    root.style.setProperty("--hs-duration", SCAN.duration + "ms");

    if (reduceMotion || !SCAN.enabled) {
      // 모션 최소화: 스캔 없이 단순 페이드인(hero-fx.css 의 reduce 규칙이 처리)
      document.body.classList.add("fx-scan-done");
      startGlitchLoop();
      return;
    }

    // 로드되면 바로 스캔 리빌 → 히어로 등장
    startScan();
  }

  /* ----- 스캐너 스윕: 클래스 토글로 CSS 애니메이션 발동 ----- */
  function startScan() {
    document.body.classList.add("fx-scanning");
    window.setTimeout(function () {
      document.body.classList.add("fx-scan-done");   // 텍스트 순차 등장 시작
      document.body.classList.remove("fx-scanning");
      root.classList.remove("fx-scan-wait");         // 커버 제거
      startGlitchLoop();                             // 히어로가 다 드러난 뒤 글리치 시작
    }, SCAN.duration + SCAN.holdAfter);
  }

  /* ----- 글리치 버스트 스케줄러: 랜덤 간격으로 .is-glitching 을 잠깐씩 ----- */
  function startGlitchLoop() {
    if (!GLITCH.enabled || reduceMotion) return;

    var hero = document.querySelector(".hero");
    if (!hero) return;

    // 첫 버스트는 히어로가 드러나자마자 짧은 딜레이 후 바로 1회(존재감 어필),
    // 이후부터는 min~max 랜덤 간격으로 반복
    glitchTimer = window.setTimeout(burst, GLITCH.firstDelay);

    function schedule() {
      window.clearTimeout(glitchTimer);
      glitchTimer = window.setTimeout(burst, rand(GLITCH.minInterval, GLITCH.maxInterval));
    }

    function burst() {
      if (bursting) return;
      bursting = true;
      var dur = rand(GLITCH.minDuration, GLITCH.maxDuration);
      hero.style.setProperty("--hg-dur", dur + "ms"); // 이번 버스트 길이를 CSS에 전달
      hero.classList.add("is-glitching");
      window.setTimeout(function () {
        hero.classList.remove("is-glitching");
        bursting = false;
        schedule();                                   // 다음 버스트 예약
      }, dur);
    }

    // 콘솔 테스트용 훅:
    //   HeroFX.burst() → 즉시 1회 발동 / HeroFX.stop() → 자동 스케줄 정지
    //   HeroFX.config.minInterval = 1000 등으로 빈도 실시간 조절
    window.HeroFX = {
      burst: burst,
      stop: function () { window.clearTimeout(glitchTimer); },
      config: GLITCH
    };
  }

  function rand(min, max) {
    return Math.round(min + Math.random() * (max - min));
  }
})();
