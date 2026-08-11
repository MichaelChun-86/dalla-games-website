/* =========================================================================
   소음(NOISE) HUD — 기존 코드와 분리된 추가 파일
   게임의 핵심 규칙을 페이지가 그대로 따른다:
     "행동하면 소음이 쌓이고, 소음은 무리를 부른다. 가만히 있으면 가라앉는다."
   - 방문자가 스크롤·클릭하면 소음이 오르고, 아무것도 안 하면 서서히 내려간다.
   - 일정 수준을 넘으면 게이지가 붉어지고 화면 가장자리가 아주 살짝 조여든다.
   - 하단 HUD 바는 히어로를 지나야 올라온다(첫 화면을 가리지 않도록).
   - 모션 최소화 선호 시: 게이지는 그대로 두되 비네트 연출은 CSS에서 꺼진다.

   함께 처리하는 것
   - THE LOOP 섹션의 단계별 소음 막대를, 섹션이 화면에 들어올 때 차오르게 한다.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- 조절 값 ---------- */
  var RISE_PER_SCROLL = 0.00055;  // 스크롤 1px 당 오르는 양
  var RISE_PER_CLICK  = 0.10;     // 클릭 한 번당 오르는 양
  var DECAY_PER_SEC   = 0.28;     // 가만히 있을 때 초당 내려가는 양
  var HOT_ON          = 0.70;     // 이 값을 넘으면 "HUNTED"
  var HOT_OFF         = 0.55;     // 이 값 아래로 내려가야 풀림(경계에서 깜빡이지 않게)

  var noise = 0;
  var hot = false;
  var lastScrollY = window.pageYOffset || 0;
  var lastTick = 0;

  var bar, fill, stateEl, vignette;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    bar = document.getElementById("hudBar");
    fill = document.getElementById("hudMeterFill");
    stateEl = document.getElementById("hudState");

    initLoopGauges();

    if (!bar || !fill || !stateEl) return;

    // 화면 가장자리 비네트 레이어(소음이 높을 때만 보인다)
    vignette = document.createElement("div");
    vignette.className = "noise-vignette";
    vignette.setAttribute("aria-hidden", "true");
    document.body.appendChild(vignette);

    // HUD 는 장식이므로 보조기기에서 읽지 않되, 위시리스트 버튼은 눌러야 하므로
    // 바 자체의 aria-hidden 은 풀고 수치 표시만 감춘다.
    bar.removeAttribute("aria-hidden");
    var noiseGroup = bar.querySelector(".hud-noise");
    if (noiseGroup) noiseGroup.setAttribute("aria-hidden", "true");

    // 첫 프레임이 돌기 전에도 게이지 값이 정의돼 있게 한다
    fill.style.width = "0%";

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onPress, { passive: true });
    window.addEventListener("keydown", onPress);

    onScroll();
    window.requestAnimationFrame(tick);
  }

  /* ----- 스크롤: 히어로를 지났는지 판단 + 이동량만큼 소음 상승 ----- */
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    var moved = Math.abs(y - lastScrollY);
    lastScrollY = y;

    noise = Math.min(1, noise + moved * RISE_PER_SCROLL);

    // 히어로가 화면에서 완전히 빠져나간 뒤에만 HUD 를 올린다.
    // (히어로 맨 아래 소개 문구·카피라이트를 가리지 않기 위해서다)
    var hero = document.querySelector(".hero");
    var passed = hero
      ? hero.getBoundingClientRect().bottom <= 40
      : y > 600;
    bar.classList.toggle("is-shown", passed);
  }

  function onPress() {
    noise = Math.min(1, noise + RISE_PER_CLICK);
  }

  /* ----- 매 프레임: 소음을 감쇠시키고 화면에 반영 ----- */
  function tick(now) {
    if (!lastTick) lastTick = now;
    var dt = Math.min(0.1, (now - lastTick) / 1000);   // 탭 전환 후 급감 방지
    lastTick = now;

    noise = Math.max(0, noise - DECAY_PER_SEC * dt);

    fill.style.width = (noise * 100).toFixed(1) + "%";

    // 히스테리시스: 켜지는 값과 꺼지는 값을 다르게 둬 경계에서 떨리지 않게 한다
    if (!hot && noise >= HOT_ON) hot = true;
    else if (hot && noise <= HOT_OFF) hot = false;

    bar.classList.toggle("is-hot", hot);
    document.documentElement.classList.toggle("noise-high", hot);

    var label = hot ? "HUNTED" : (noise >= 0.35 ? "RISING" : "CALM");
    if (stateEl.textContent !== label) stateEl.textContent = label;

    window.requestAnimationFrame(tick);
  }

  /* ----- THE LOOP: 섹션이 보이면 단계별 소음 막대가 차오른다 ----- */
  function initLoopGauges() {
    var steps = document.querySelectorAll(".loop-step");
    if (!steps.length) return;

    if (!("IntersectionObserver" in window)) {
      steps.forEach(function (s) { s.classList.add("is-filled"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // 들어오면 차오르고, 나가면 되돌려 다음에 다시 재생되게 한다
        e.target.classList.toggle("is-filled", e.isIntersecting);
      });
    }, { threshold: 0.4 });

    steps.forEach(function (s) { io.observe(s); });
  }
})();
