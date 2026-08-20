/* =========================================================================
   히어로 특수효과 스크립트 (기존 코드와 분리된 추가 파일)
   로드 시 스캐너 스윕 리빌 — 매 로드마다 1회.

   ※ head 에서 동기 로드:
      첫 페인트 전에 스캔 커버를 씌워, 히어로가 미리 번쩍 보이는
      깜빡임(FOUC)을 막는다.

   ※ 모션 최소화(prefers-reduced-motion) 설정과 무관하게 항상 재생한다.

   [테스트] 스캔 다시 보기: 새로고침(F5). 매 로드마다 실행된다.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- 스캐너 스윕 설정 ---------- */
  var SCAN = {
    duration: 1400,      // 스캔 전체 길이(ms) — 1200~1800 권장
    holdAfter: 80        // 스캔이 끝나고 텍스트 등장까지 짧은 여유(ms)
  };

  var root = document.documentElement;

  // 새로고침 FOUC 방지: 첫 페인트 전에 검정 커버부터 씌운다(head 동기 실행)
  root.classList.add("fx-scan-wait");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // 스캔 길이의 단일 소스는 이 파일의 SCAN.duration → CSS 변수로 전달
    root.style.setProperty("--hs-duration", SCAN.duration + "ms");
    startScan();
  }

  /* ----- 스캐너 스윕: 클래스 토글로 CSS 애니메이션 발동 ----- */
  function startScan() {
    document.body.classList.add("fx-scanning");
    window.setTimeout(function () {
      document.body.classList.add("fx-scan-done");   // 텍스트 순차 등장 시작
      document.body.classList.remove("fx-scanning");
      root.classList.remove("fx-scan-wait");         // 커버 제거
    }, SCAN.duration + SCAN.holdAfter);
  }
})();
