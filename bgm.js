/* =========================================================================
   BGM 플레이어 — 기본적으로 자동재생된다.
   - 브라우저는 "소리 있는" 자동재생은 대부분 막지만, "무음" 자동재생은
     항상 허용한다. 그래서 페이지 로드 즉시 무음으로 재생을 시작해 두고,
     인트로가 끝나 히어로가 노출되는 순간 음소거만 해제한다.
     (이미 재생 중인 요소의 음소거 해제는 사용자 제스처 없이도 허용된다.)
   - 극히 드물게 무음 자동재생마저 막히는 환경이면, 페이지의 첫 사용자
     제스처(클릭/키/터치)에서 재생을 재시도한다.
   - 우측 상단(헤더 바로 아래) 아이콘 버튼으로 언제든 켜기/끄기 가능.
   - 커서는 별도로 지정하지 않는다: <button> 요소라 style.css / cursor-trail.css
     의 전역 커서(호버 시 깜박이는 잔상 커서) 규칙을 그대로 물려받는다.
   - 트랙 교체: BGM/Ready/ 안의 후보 파일을 BGM/ 로 꺼내 넣고,
     아래 BGM_SRC 파일명만 맞춰 바꾸면 된다.
   ========================================================================= */
(function () {
  "use strict";

  var BGM_SRC = "BGM/suspense-tension-background-music-323181.mp3";
  var VOLUME = 0.6;
  var MUTE_KEY = "aeon-bgm-muted";

  var audio = new Audio(BGM_SRC);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = "auto";

  var userMuted = false;   // 사용자가 버튼으로 직접 음소거를 선택했는지
  try { userMuted = localStorage.getItem(MUTE_KEY) === "1"; } catch (e) {}

  var revealed = false;    // 인트로 종료(히어로 노출) 시점이 됐는지
  var playing = false;     // audio.play() 가 실제로 성공했는지

  // ----- 소리 들려줄지 여부를 실제 audio 상태에 반영 -----
  function syncAudibility() {
    audio.muted = userMuted || !revealed;
    refreshButton();
  }

  // ----- 무음으로 즉시 재생 시작(항상 허용됨) -----
  audio.muted = true;
  startPlayback();

  function startPlayback() {
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () {
        playing = true;
        refreshButton();
      }).catch(function () {
        // 극히 드물게 무음 자동재생마저 차단됨 → 사용자 제스처에서 재시도
        armGestureFallback();
      });
    } else {
      playing = true;
      refreshButton();
    }
  }

  function armGestureFallback() {
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, function onGesture() {
        window.removeEventListener(ev, onGesture);
        startPlayback();
      }, { passive: true });
    });
  }

  // ----- 인트로 종료(히어로 노출) 시점 감지 → 그 순간부터 소리 켜기 -----
  function watchIntro() {
    var body = document.body;
    var introRunning =
      body.classList.contains("intro-active") ||
      document.documentElement.classList.contains("intro-playing");

    if (!introRunning) {
      // 인트로가 아예 실행되지 않음(세션 재방문 / 모션 최소화 선호) → 바로 소리 켜기
      revealed = true;
      syncAudibility();
      return;
    }

    var observer = new MutationObserver(function () {
      if (body.classList.contains("intro-done")) {
        observer.disconnect();
        revealed = true;
        syncAudibility();
      }
    });
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchIntro);
  } else {
    watchIntro();
  }

  // ----- 우측 상단 컨트롤 버튼(아이콘 하나, 클릭으로 켜기/끄기) -----
  var buttonEl = null;

  function buildButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bgm-toggle";
    btn.setAttribute("aria-label", "Toggle background music");
    btn.innerHTML =
      '<svg class="bgm-icon-on" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M4 9v6h4l5 5V4L8 9H4z"/>' +
        '<path d="M15.5 8.5a5 5 0 0 1 0 7"/>' +
        '<path d="M18 6a9 9 0 0 1 0 12"/>' +
      '</svg>' +
      '<svg class="bgm-icon-off" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M4 9v6h4l5 5V4L8 9H4z"/>' +
        '<line x1="16" y1="9" x2="21" y2="14"/>' +
        '<line x1="21" y1="9" x2="16" y2="14"/>' +
      '</svg>';
    document.body.appendChild(btn);

    btn.addEventListener("click", function () {
      if (userMuted || !revealed) {
        // 꺼져 있던 상태(음소거 또는 인트로 진행 중) → 사용자가 직접 켬:
        // 인트로가 아직 안 끝났어도 명시적 클릭이므로 바로 들려준다.
        userMuted = false;
        revealed = true;
      } else {
        userMuted = true;
      }
      try { localStorage.setItem(MUTE_KEY, userMuted ? "1" : "0"); } catch (e) {}
      if (!playing) startPlayback();
      syncAudibility();
    });

    return btn;
  }

  function refreshButton() {
    if (!buttonEl) return;
    var showOff = userMuted || !revealed || !playing;
    buttonEl.classList.toggle("is-muted", showOff);
  }

  function initButton() {
    buttonEl = buildButton();
    refreshButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initButton);
  } else {
    initButton();
  }
})();
