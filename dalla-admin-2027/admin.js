/* =========================================================================
   달라게임즈 관리자 대시보드

   ┌──────────────────────────────────────────────────────────────────────┐
   │ ★ 먼저 읽어주세요 — 지금은 "샘플 데이터"로 돌아갑니다               │
   │                                                                      │
   │ GA4 수치는 브라우저에서 직접 읽어올 수 없습니다.                     │
   │ GA4 Data API 는 구글 인증(OAuth/서비스 계정 키)을 요구하는데,        │
   │ 그 키를 이 파일에 넣으면 사이트 소스를 여는 누구나 볼 수 있습니다.   │
   │ 즉 열쇠를 현관문에 테이프로 붙여두는 것과 같습니다.                  │
   │ GitHub Pages 는 정적 호스팅이라 키를 숨길 서버가 없습니다.           │
   │                                                                      │
   │ 그래서 화면(레이아웃·디자인·인증)은 전부 완성해 두고,                │
   │ 숫자만 아래 SAMPLE 값으로 그리고 있습니다.                           │
   │ 실데이터를 붙이는 방법은 이 파일 맨 아래 [실데이터 연결] 참고.       │
   └──────────────────────────────────────────────────────────────────────┘

   [PIN 바꾸는 법]
     1) 이 페이지를 열고 브라우저 콘솔(F12)에서:  await AdminPIN.hash("네자리")
     2) 출력된 긴 문자열을 아래 PIN_SHA256 에 붙여넣기
     ※ 현재 PIN 은 2027 입니다. 반드시 바꾸세요.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     설정
     --------------------------------------------------------------------- */

  /* PIN(2027)의 SHA-256 해시. 원문을 그대로 두지 않기 위한 것이지
     암호학적 보호는 아닙니다 — 아래 [보안 한계] 참고. */
  var PIN_SHA256 = "5313e5bf17148de844ff74be3663d47c6e361ca469b30a36337701233c89a15e";

  /* 실데이터 프록시 주소. 비워 두면 샘플 데이터로 그린다.
     (예: "https://dalla-ga4.your-name.workers.dev/metrics") */
  var API_ENDPOINT = "";

  var SESSION_KEY = "dalla-admin-ok";

  /* ---------------------------------------------------------------------
     샘플 데이터 — 실데이터가 붙으면 이 값은 쓰이지 않습니다.
     구조는 프록시가 돌려줘야 할 JSON 형태와 정확히 같습니다.
     --------------------------------------------------------------------- */
  var SAMPLE = {
    todayUsers: 128,
    todayDeltaPct: 12,          // 어제 대비 %
    weekUsers: 741,
    weekDeltaPct: -4,           // 지난주 대비 %
    wishlistClicks: 96,
    avgEngagementSec: 104,      // 초
    sources: [
      { name: "YouTube",  sessions: 312 },
      { name: "Direct",   sessions: 205 },
      { name: "Search",   sessions: 158 },
      { name: "X/Twitter", sessions: 96 },
      { name: "Steam",    sessions: 47 }
    ],
    countries: [
      { name: "대한민국",   users: 286 },
      { name: "미국",       users: 174 },
      { name: "중국",       users: 91 },
      { name: "일본",       users: 78 },
      { name: "독일",       users: 42 }
    ],
    events: [
      { name: "위시리스트 클릭", key: "wishlist_click",  count: 96 },
      { name: "트레일러 재생",   key: "trailer_play",    count: 214 },
      { name: "FAQ 열람",        key: "faq_view",        count: 168 },
      { name: "언어 변경",       key: "language_change", count: 73 }
    ],
    placements: [
      { name: "히어로 버튼",   key: "hero",   count: 51 },
      { name: "하단 고정 바",  key: "hud",    count: 28 },
      { name: "푸터 아이콘",   key: "footer", count: 11 },
      { name: "모바일 메뉴",   key: "menu",   count: 6 }
    ]
  };

  /* 도넛/막대에 쓰는 네온 계열 색 (진한 그린 → 옅은 그린) */
  var PALETTE = ["#08e178", "#2bff97", "#00b45f", "#5affb4", "#0d7d47"];

  /* ---------------------------------------------------------------------
     PIN 인증
     --------------------------------------------------------------------- */
  var lock = document.getElementById("lock");
  var dash = document.getElementById("dash");
  var form = document.getElementById("pinForm");
  var input = document.getElementById("pinInput");
  var err = document.getElementById("pinErr");

  async function sha256(text) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.prototype.map
      .call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  /* 콘솔에서 새 PIN 의 해시를 뽑기 위한 도우미 */
  window.AdminPIN = { hash: sha256 };

  function unlock() {
    lock.hidden = true;
    dash.hidden = false;
    render();
  }

  function lockUp() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    location.reload();
  }

  /* 이전에 인증했으면 바로 통과 */
  try {
    if (localStorage.getItem(SESSION_KEY) === PIN_SHA256) unlock();
  } catch (e) {}

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var got = await sha256(input.value.trim());
    if (got === PIN_SHA256) {
      try { localStorage.setItem(SESSION_KEY, PIN_SHA256); } catch (e2) {}
      err.hidden = true;
      unlock();
      return;
    }
    // 틀림: 흔들고 비운다
    err.hidden = false;
    var box = lock.querySelector(".lock-box");
    box.classList.remove("shake");
    void box.offsetWidth;            // 애니메이션 재시작을 위한 리플로우
    box.classList.add("shake");
    input.value = "";
    input.focus();
  });

  document.getElementById("logout").addEventListener("click", lockUp);
  document.getElementById("refresh").addEventListener("click", render);

  /* ---------------------------------------------------------------------
     데이터 가져오기 — 실데이터/샘플의 유일한 분기점
     --------------------------------------------------------------------- */
  async function loadMetrics() {
    if (!API_ENDPOINT) return { data: SAMPLE, live: false };
    try {
      var res = await fetch(API_ENDPOINT, { credentials: "omit" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return { data: await res.json(), live: true };
    } catch (e) {
      return { data: SAMPLE, live: false, error: e.message };
    }
  }

  /* ---------------------------------------------------------------------
     그리기
     --------------------------------------------------------------------- */
  var $ = function (id) { return document.getElementById(id); };
  var num = function (n) { return Number(n).toLocaleString("ko-KR"); };

  function mmss(sec) {
    var m = Math.floor(sec / 60), s = Math.round(sec % 60);
    return m + "분 " + String(s).padStart(2, "0") + "초";
  }

  function delta(pct) {
    if (pct === 0 || pct == null) return "&nbsp;";
    var up = pct > 0;
    return '<span class="' + (up ? "up" : "down") + '">' +
           (up ? "▲" : "▼") + " " + Math.abs(pct) + "%</span> 이전 대비";
  }

  /* 막대 목록 하나를 그린다 */
  function drawBars(el, rows, unit) {
    var max = Math.max.apply(null, rows.map(function (r) { return r.count || r.users; })) || 1;
    el.innerHTML = rows.map(function (r) {
      var v = r.count != null ? r.count : r.users;
      return '<li>' +
        '<div class="bar-top"><span class="bar-name">' + r.name + '</span>' +
        '<span class="bar-num">' + num(v) + unit + '</span></div>' +
        '<div class="bar-track"><i class="bar-fill" data-w="' + (v / max * 100) + '"></i></div>' +
        '</li>';
    }).join("");
    // 다음 프레임에 폭을 줘야 CSS transition 이 살아난다
    requestAnimationFrame(function () {
      el.querySelectorAll(".bar-fill").forEach(function (f) {
        f.style.width = f.dataset.w + "%";
      });
    });
  }

  /* 유입 경로: 도넛 + 표 */
  function drawSources(rows) {
    var total = rows.reduce(function (a, r) { return a + r.sessions; }, 0) || 1;
    $("donutTotal").textContent = num(total);

    var C = 2 * Math.PI * 52;        // r=52 원둘레
    var offset = 0;
    $("donutSegs").innerHTML = rows.map(function (r, i) {
      var frac = r.sessions / total;
      var seg = '<circle class="donut-seg" cx="60" cy="60" r="52" ' +
                'stroke="' + PALETTE[i % PALETTE.length] + '" ' +
                'stroke-dasharray="0 ' + C + '" ' +
                'stroke-dashoffset="' + (-offset * C) + '" ' +
                'data-len="' + (frac * C) + '" data-gap="' + C + '"></circle>';
      offset += frac;
      return seg;
    }).join("");
    requestAnimationFrame(function () {
      $("donutSegs").querySelectorAll(".donut-seg").forEach(function (s) {
        s.setAttribute("stroke-dasharray", s.dataset.len + " " + s.dataset.gap);
      });
    });

    $("srcTable").querySelector("tbody").innerHTML = rows.map(function (r, i) {
      return '<tr>' +
        '<td><span class="c-name"><span class="swatch" style="background:' +
          PALETTE[i % PALETTE.length] + '"></span>' + r.name + '</span></td>' +
        '<td class="c-num">' + num(r.sessions) + '</td>' +
        '<td class="c-pct">' + Math.round(r.sessions / total * 100) + '%</td>' +
        '</tr>';
    }).join("");
  }

  async function render() {
    var out = await loadMetrics();
    var d = out.data;

    // 샘플일 때만 배너
    var notice = $("notice");
    notice.hidden = out.live;
    if (!out.live) {
      $("noticeText").textContent = out.error
        ? "실데이터 서버에 연결하지 못해 샘플로 표시합니다 (" + out.error + ")."
        : "아직 실데이터 연결 전이라 화면 확인용 예시 숫자입니다. admin.js 의 API_ENDPOINT 를 채우면 실제 수치로 바뀝니다.";
    }

    // KPI
    $("kpiToday").textContent = num(d.todayUsers);
    $("kpiTodayDelta").innerHTML = delta(d.todayDeltaPct);
    $("kpiWeek").textContent = num(d.weekUsers);
    $("kpiWeekDelta").innerHTML = delta(d.weekDeltaPct);
    $("kpiWish").textContent = num(d.wishlistClicks);
    $("kpiWishFoot").textContent = "버튼 4곳 합계";

    var ctr = d.weekUsers ? (d.wishlistClicks / d.weekUsers * 100) : 0;
    $("kpiCtr").textContent = ctr.toFixed(1) + "%";
    $("kpiTime").textContent = mmss(d.avgEngagementSec);

    drawSources(d.sources);
    drawBars($("countryBars"), d.countries, "명");
    drawBars($("eventBars"), d.events, "회");
    drawBars($("placementBars"), d.placements, "회");

    $("updated").textContent = new Date().toLocaleString("ko-KR", {
      month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit"
    }) + " 기준";
  }
})();

/* =========================================================================
   [실데이터 연결] — 셋 중 하나를 고르면 됩니다

   ① Looker Studio (가장 쉬움, 무료, 코드 0줄)
      GA4에 구글이 만들어 둔 무료 대시보드를 붙이는 방법입니다.
        lookerstudio.google.com → 만들기 → 보고서 → GA4 연결
        → 완성된 보고서 [공유 > 삽입] 에서 iframe 코드 복사
        → 이 페이지에 그대로 붙이면 끝.
      단점: 디자인이 구글 기본 스타일이라 지금 이 화면과 느낌이 다릅니다.

   ② Cloudflare Worker 프록시 (지금 이 디자인 그대로 실데이터, 무료)
      구글 키를 서버 쪽에 숨겨두고, 이 페이지는 숫자만 받아오는 방식입니다.
        1. 구글 클라우드에서 서비스 계정 만들고 GA4 속성에 뷰어 권한 부여
        2. Cloudflare Workers(무료)에 그 키를 secret 으로 저장
        3. Worker 가 GA4 Data API 를 호출해 위 SAMPLE 과 같은 모양의
           JSON 을 돌려주도록 작성
        4. 그 주소를 위 API_ENDPOINT 에 입력
      → 이 화면 디자인을 그대로 쓰면서 진짜 숫자가 들어옵니다.
         원하시면 Worker 코드까지 만들어 드립니다.

   ③ GA4 앱/웹으로 직접 보기
      대시보드가 굳이 필요 없다면 GA4 화면이나 구글 애널리틱스 앱이
      가장 정확합니다. 이 페이지는 즐겨찾기용 요약으로만 두는 방식.

   [보안 한계 — 꼭 알아두세요]
     이 PIN 잠금은 "우연히 들어온 사람을 막는 자물쇠"이지 보안이 아닙니다.
     정적 사이트라 검사는 브라우저 안에서 일어나고, 네 자리 숫자의 해시는
     맞춰보면 금방 뚫립니다. 주소를 모르면 못 들어오는 것이 사실상의 방어선입니다.
     (그래서 robots.txt 에는 이 경로를 적지 않았습니다 —
      적는 순간 "여기 관리자 페이지가 있다"고 공개하는 셈이라 역효과입니다.)
     진짜 접근 제어가 필요하면 Cloudflare Access 무료 플랜으로
     구글 계정 로그인을 걸 수 있습니다. 필요하시면 말씀해 주세요.
   ========================================================================= */
