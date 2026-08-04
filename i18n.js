/* =========================================================================
   다국어(로컬라이제이션) — 한국어 / English / 中文 / 日本語
   - 메뉴 우측 국기 버튼 클릭 시 지정 부분만 언어 전환.
   - 대상:
       · 히어로(Coming 2027, Epic MegaGrant) — 4개 언어 모두 번역.
       · OUR GAMES / ABOUT US 제목 — 한국어는 영문 그대로(ko 키 없음),
         中文·日本語는 번역.
       · OUR GAMES / ABOUT US 하위 내용(부제·특징·팀원·태그라인) — 4개 언어 번역.
     (헤더 메뉴·푸터·트레일러 라벨 등 그 외 텍스트는 항상 그대로 둔다.)
   - 선택 언어는 localStorage 에 저장되어 다음 방문에도 유지된다.
   - 게임 프로젝트명은 모든 언어에서 항상 "AeonFall"(로고 이미지 자체는 제외).
   - data-i18n     : textContent 교체
     data-i18n-html: innerHTML 교체(accent 강조 span 포함)
   - 특정 언어에 번역이 없는 키(예: 한국어의 games.title/about.title)는 페이지에
     원래 쓰여 있던 원문(영문)으로 되돌아간다. 그래서 언어를 오갔다가 돌아와도
     이전 언어가 어색하게 남지 않는다.
   ========================================================================= */
(function () {
  "use strict";

  var LANGS = ["ko", "en", "zh", "ja"];
  var STORE_KEY = "aeon-lang";

  var T = {
    /* ---- 히어로 (4개 언어 모두 번역) ---- */
    "hero.coming": {
      ko: "2027 출시 예정", en: "Coming 2027", zh: "预计 2027 年发售", ja: "2027年 発売予定"
    },
    "epic.title": {
      ko: "에픽 메가그랜트 선정", en: "Epic MegaGrant Recipient",
      zh: "Epic MegaGrant 获选者", ja: "Epic MegaGrant 採択"
    },
    "epic.text": {
      ko: "에픽게임즈의 지원과 함께, AeonFall의 개발 가속화에 한층 더 박차를 가하고 있습니다.",
      en: "Epic Games’ support is helping us accelerate development of AeonFall.",
      zh: "在 Epic Games 的支持下，我们正加速开发 AeonFall。",
      ja: "Epic Games のサポートにより、AeonFall の開発を加速しています。"
    },

    /* ---- OUR GAMES ---- 제목은 ko 키 없음(영문 유지), 하위 내용은 번역 ---- */
    "games.title": {
      en: 'OUR <span class="accent">GAMES</span>',
      zh: '我们的<span class="accent">游戏</span>',
      ja: '私たちの<span class="accent">ゲーム</span>'
    },
    "games.subtitle": {
      ko: "AeonFall – 하드코어 로그라이크 디펜스",
      en: "AeonFall – Hardcore Roguelike Defense",
      zh: "AeonFall – 硬核 Roguelike 塔防",
      ja: "AeonFall – ハードコア・ローグライク・ディフェンス"
    },
    "f1.title": { ko: "압도적인 물량", en: "Massive Waves", zh: "海量敌潮", ja: "圧倒的な物量" },
    "f1.desc": {
      ko: "한계를 시험하는 규모의 적들이 끝없이 몰려옵니다. 모든 전투가 압도적인 수와의 싸움입니다.",
      en: "Face relentless hordes at a scale that pushes your limits. Every battle is a fight against overwhelming numbers.",
      zh: "面对将你逼至极限的无尽敌群。每一场战斗都是与压倒性数量的较量。",
      ja: "限界を試す規模の敵の群れが絶え間なく押し寄せます。あらゆる戦いが圧倒的な数との戦いです。"
    },
    "f2.title": { ko: "소음이 부르는 위협", en: "Noise-Driven Threat", zh: "噪声引发的威胁", ja: "騒音が招く脅威" },
    "f2.desc": {
      ko: "당신의 모든 행동은 소음을 만들고, 소음은 죽음을 부릅니다. 신중히 확장하지 않으면 막을 수 없는 웨이브가 시작됩니다.",
      en: "Every action you take generates noise — and noise brings death. Expand carefully, or trigger unstoppable waves.",
      zh: "你的每个动作都会产生噪声——而噪声招致死亡。谨慎扩张，否则将引发无法阻挡的敌潮。",
      ja: "あなたのあらゆる行動は騒音を生み、騒音は死を招きます。慎重に拡張しなければ、止められない波が押し寄せます。"
    },
    "f3.title": { ko: "하이브리드 컨트롤", en: "Hybrid Control", zh: "混合操控", ja: "ハイブリッド操作" },
    "f3.desc": {
      ko: "실시간으로 기지를 짓고 방어하면서 캐릭터를 직접 조종하세요. 액션과 전략의 균형으로 생존하세요.",
      en: "Directly control your character while building and defending your base in real time. Balance action and strategy to survive.",
      zh: "实时建造并防守基地的同时，直接操控你的角色。平衡动作与策略，方能生存。",
      ja: "リアルタイムで拠点を築き守りながら、キャラクターを直接操作。アクションと戦略のバランスで生き延びましょう。"
    },
    "f4.title": { ko: "다이내믹 생존", en: "Dynamic Survival", zh: "动态生存", ja: "ダイナミックな生存" },
    "f4.desc": {
      ko: "지형, 자원, 적 패턴이 매번 달라지며 플레이가 새롭게 전개됩니다. 적응하지 못하면 무너집니다.",
      en: "Each run unfolds differently with shifting terrain, resources, and enemy patterns. Adapt or be overwhelmed.",
      zh: "地形、资源与敌人模式每局都不同，每次游玩都独一无二。适应，否则被吞没。",
      ja: "地形・資源・敵のパターンが毎回変化し、プレイは常に新たに展開します。適応せよ、さもなくば圧倒されます。"
    },

    /* ---- ABOUT US ---- 제목은 ko 키 없음(영문 유지), 하위 내용은 번역 ---- */
    "about.title": {
      en: 'ABOUT <span class="accent">US</span>',
      zh: '关于<span class="accent">我们</span>', ja: '<span class="accent">私たち</span>について'
    },
    "about.subtitle": {
      en: "Dalla Games Inc.", zh: "Dalla Games Inc.", ja: "Dalla Games Inc."
    },
    "m1.name": {
      ko: '<span class="accent">CEO</span> 천준영',
      en: '<span class="accent">CEO</span> JoonYoung Chun',
      zh: '<span class="accent">CEO</span> JoonYoung Chun',
      ja: '<span class="accent">CEO</span> JoonYoung Chun'
    },
    "m1.role": {
      ko: "리드 아티스트 / 컨셉 기획", en: "Lead Artist / Concept Designer",
      zh: "首席美术 / 概念设计师", ja: "リードアーティスト / コンセプトデザイナー"
    },
    "m2.name": {
      ko: '<span class="accent">CTO</span> 김윤규',
      en: '<span class="accent">CTO</span> YunKyu Kim',
      zh: '<span class="accent">CTO</span> YunKyu Kim',
      ja: '<span class="accent">CTO</span> YunKyu Kim'
    },
    "m2.role": {
      ko: "리드 프로그래머 / 시스템 기획", en: "Lead Programmer / Lead Game Designer",
      zh: "首席程序 / 首席游戏设计师", ja: "リードプログラマー / リードゲームデザイナー"
    },
    "tagline": {
      ko: "모든 선택이 의미를 갖고, 모든 실수가 대가를 치르는 게임을 만듭니다.",
      en: "We build games where every decision matters and every mistake has consequences.",
      zh: "我们打造每个决定都举足轻重、每个失误都付出代价的游戏。",
      ja: "すべての選択に意味があり、すべてのミスに代償が伴うゲームを作ります。"
    }
  };

  // 각 대상 요소의 "원래(영문) 내용"을 최초 1회 저장해 둔다.
  // 특정 언어에 번역이 없을 때(예: ko 의 games.title/about.title) 이 원문으로 되돌아간다.
  var ORIG_TEXT = new WeakMap();
  var ORIG_HTML = new WeakMap();
  function captureOriginals() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      ORIG_TEXT.set(el, el.textContent);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      ORIG_HTML.set(el, el.innerHTML);
    });
  }

  function apply(lang) {
    if (LANGS.indexOf(lang) === -1) lang = "en";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var val = (T[k] && T[k][lang] != null) ? T[k][lang] : ORIG_TEXT.get(el);
      el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html");
      var val = (T[k] && T[k][lang] != null) ? T[k][lang] : ORIG_HTML.get(el);
      el.innerHTML = val;
    });

    // <html lang> 갱신(접근성/폰트 폴백/CSS 훅 — i18n.css 의 CJK 폰트 보정이 이 값을 참조)
    document.documentElement.setAttribute("lang", lang);

    // 선택된 국기 강조
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  // 기본 언어는 영어. (브라우저 언어 자동 감지는 하지 않음)
  // 단, 사용자가 국기로 직접 고른 언어가 있으면 다음 방문에도 그 언어를 유지한다.
  function initialLang() {
    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (saved && LANGS.indexOf(saved) !== -1) return saved;
    return "en";
  }

  function init() {
    captureOriginals();
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
    });
    apply(initialLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
