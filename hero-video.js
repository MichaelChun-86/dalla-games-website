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

    /* 주소를 넣은 뒤 load() 로 내려받기를 직접 시작한다.
       preload 를 auto 로 바꿨지만, src 를 자바스크립트로 나중에 넣는 경우
       브라우저가 알아서 받기 시작하지 않는 때가 있다.
       받지 못하면 프레임이 없어 화면이 그대로 검게 남는다. */
    video.load();

    /* 항상 재생 상태를 유지한다.
       브라우저는 여러 이유로 영상을 멈춘다 — 탭을 숨겼다 돌아오거나,
       절전 모드에 들어가거나, 뒤로가기로 캐시된 페이지가 복원될 때.
       loop 속성만으로는 "한 번 멈춘 뒤" 다시 살아나지 않으므로,
       멈추면 다시 트는 감시를 붙인다. */
    /* force=true 면 화면에 보이는지와 무관하게 시도한다.
       첫 재생은 반드시 force 로 부른다 — 여기서 걸러지면 다운로드조차
       시작되지 않아 배경이 검은 채로 남는다(실제로 그렇게 됐었다). */
    function keepPlaying(force) {
      if (!force && document.hidden) return;   // 되살리기는 보일 때만
      if (!video.paused) return;
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    video.addEventListener("pause", function () { keepPlaying(); });
    video.addEventListener("ended", function () { keepPlaying(); });   // loop 어긋남 대비
    video.addEventListener("stalled", function () { keepPlaying(); });
    document.addEventListener("visibilitychange", function () { keepPlaying(); });
    window.addEventListener("pageshow", function () { keepPlaying(); });
    window.addEventListener("focus", function () { keepPlaying(); });

    /* 데이터가 들어오는 대로 한 번 더 시도 — 첫 play() 가 아직 데이터가 없어
       거절당했을 수 있다 */
    video.addEventListener("loadeddata", function () { keepPlaying(true); });
    video.addEventListener("canplay", function () { keepPlaying(true); });

    keepPlaying(true);   // 최초 재생: 조건 없이
  }
})();
