/* =========================================================================
   히어로 배경 영상 로더 — 기존 코드와 분리된 추가 파일
   영상 주소를 data-src 에 넣어두고, 실제로 필요한 경우에만 src 로 옮겨 담는다.

   왜 이렇게 하나
   - CSS 의 display:none 은 <video> 의 다운로드를 막지 못한다.
     화면에 안 보이는 상황에서도 통째로 받아버려 데이터가 낭비된다.
   - 배경 영상은 모션 최소화 설정과 무관하게 항상 재생한다(요청 사항).
     느리게 도는 배경이라 시선을 빼앗지 않는다고 보고 예외로 뒀다.
     대신 글리치·스캔처럼 튀는 연출은 여전히 그 설정을 따른다(hero-fx.js).
   - 모바일에서도 재생한다(영상이 약 5MB 로 가벼워진 뒤 허용).
     단 preload="none" 이라 화면에 필요할 때부터 받기 시작한다.
   ========================================================================= */
(function () {
  "use strict";

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    var video = document.querySelector(".hero-bg-video");
    if (!video) return;

    // 화면 폭에 맞는 영상만 고른다 — 데스크톱 16:9 / 모바일 3:4 세로본.
    // 세로 화면에 가로 영상을 넣으면 좌우가 크게 잘려 화질이 뭉개진다.
    var isMobile =
      window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

    var src = isMobile
      ? video.getAttribute("data-src-mobile") || video.getAttribute("data-src")
      : video.getAttribute("data-src");
    if (!src) return;

    // 포스터도 화면 방향에 맞는 것으로 — 가로 이미지가 세로 화면에서 잘려 보이지 않게
    var mobilePoster = video.getAttribute("data-poster-mobile");
    if (isMobile && mobilePoster) {
      video.setAttribute("poster", mobilePoster);
    }

    video.src = src;

    // 자동재생은 muted + playsinline 이 있어야 허용된다(HTML 에 지정해 둠).
    // 그래도 막히는 환경이면 조용히 넘어가고 poster 가 남는다.
    var played = video.play();
    if (played && played.catch) {
      played.catch(function () {});
    }
  }
})();
