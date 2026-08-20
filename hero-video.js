/* =========================================================================
   히어로 배경 영상 로더 — 기존 코드와 분리된 추가 파일
   영상 주소를 data-src 에 넣어두고, 실제로 필요한 경우에만 src 로 옮겨 담는다.

   왜 이렇게 하나
   - CSS 의 display:none 은 <video> 의 다운로드를 막지 못한다.
     화면에 안 보이는 상황에서도 통째로 받아버려 데이터가 낭비된다.
   - 배경 영상은 모션 최소화 설정과 무관하게 항상 재생한다(요청 사항).
     느리게 도는 배경이라 시선을 빼앗지 않는다고 보고 예외로 뒀다.
     스캔 리빌 등 다른 연출도 마찬가지로 항상 재생한다.
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

    video.loop = true;               // 속성으로도 걸려 있지만 확실히 해 둔다

    /* 항상 재생 상태를 유지한다.
       브라우저는 여러 이유로 영상을 멈춘다 — 탭을 숨겼다 돌아오거나,
       절전 모드에 들어가거나, 뒤로가기로 캐시된 페이지가 복원될 때.
       loop 속성만으로는 "한 번 멈춘 뒤" 다시 살아나지 않으므로,
       멈추면 다시 트는 감시를 붙인다. */
    function keepPlaying() {
      if (document.hidden) return;   // 안 보이는 동안은 굳이 되살리지 않는다
      if (!video.paused) return;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    video.addEventListener("pause", keepPlaying);
    video.addEventListener("ended", keepPlaying);        // loop 이 어긋난 경우 대비
    video.addEventListener("stalled", keepPlaying);
    document.addEventListener("visibilitychange", keepPlaying);
    window.addEventListener("pageshow", keepPlaying);    // 뒤로가기 복귀
    window.addEventListener("focus", keepPlaying);

    keepPlaying();
  }
})();
