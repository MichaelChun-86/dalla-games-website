/* =========================================================================
   쿠키 동의 배너
   - 방문자가 고르기 전까지 화면 아래에 배너를 띄운다.
       · "모두 허용"  → Google Analytics(방문 통계) 쿠키 사용에 동의
       · "필수만 허용" → 통계 쿠키를 쓰지 않는다 (사이트는 그대로 정상 동작)
   - 고른 값은 이 브라우저의 localStorage "dalla-consent" 에 남는다
     ("granted" 또는 "denied"). 다음 방문부터는 배너가 뜨지 않는다.
   - 페이지 맨 아래 "쿠키 설정" 을 누르면 배너가 다시 떠서 선택을 바꿀 수 있다.
   - 고를 때마다 "dalla:consent" 이벤트를 보내고, analytics.js 가 이를 듣고
     GA4 를 켜거나(동의) 끈다(철회 — 이미 심어진 통계 쿠키도 지운다).
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "dalla-consent";

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  // "필수만 허용"을 고르면 이미 심어진 통계 쿠키(_ga, _ga_XXXX)를 지운다.
  // (개인정보처리방침 페이지처럼 analytics.js 가 없는 곳에서 골라도 지워지도록 여기서 처리)
  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name.indexOf("_ga") !== 0) return;
      document.cookie = name + "=; Max-Age=0; path=/; domain=." + location.hostname.replace(/^www\./, "");
      document.cookie = name + "=; Max-Age=0; path=/";
    });
  }

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    if (value === "denied") clearAnalyticsCookies();
    // analytics.js 에 알린다 (같은 페이지 안에서 바로 반영되도록)
    try { window.dispatchEvent(new Event("dalla:consent")); } catch (e) {}
  }

  function init() {
    var bar = document.getElementById("ccBar");
    if (!bar) return;

    function show() { bar.hidden = false; }
    function hide() { bar.hidden = true; }

    // 아직 고르지 않았으면 배너를 띄운다
    if (read() !== "granted" && read() !== "denied") show();

    // 배너 버튼: data-cc="granted" / "denied"
    bar.querySelectorAll("[data-cc]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        save(btn.getAttribute("data-cc"));
        hide();
      });
    });

    // 푸터 "쿠키 설정": 배너를 다시 연다
    document.querySelectorAll("[data-cc-open]").forEach(function (btn) {
      btn.addEventListener("click", show);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
