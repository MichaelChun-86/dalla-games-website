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
    /* 로고 위 장르 한 줄 / 로고 아래 훅 한 줄. 영문은 전부 대문자로 쓴다. */
    "hero.genre": {
      ko: "하드코어 로그라이크 디펜스",
      en: "HARDCORE ROGUELIKE DEFENSE",
      zh: "硬核 ROGUELIKE 塔防",
      ja: "ハードコア・ローグライク・ディフェンス"
    },
    "hero.hook": {
      ko: "성장과 안전은 결코 같은 선택이 될 수 없다",
      en: "GROWTH AND SAFETY ARE NEVER THE SAME CHOICE",
      zh: "成长与安全，绝不可能是同一个选择",
      ja: "成長と安全は、決して同じ選択にはなり得ない"
    },
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

    /* ---- THE LOOP ---- 제목은 ko 키 없음(영문 유지), 하위 내용은 번역 ---- */
    "loop.title": {
      en: 'THE <span class="accent">LOOP</span>',
      zh: '一<span class="accent">局</span>的流程', ja: '<span class="accent">1</span>プレイの流れ'
    },
    "loop.subtitle": {
      ko: "성장할수록 커지는 소음, 압도적 웨이브 속에서 살아남아야 한다.",
      en: "The more you grow, the louder you get — and you have to survive the waves that follow.",
      zh: "成长越多，噪声越大 —— 你必须在压倒性的敌潮中活下来。",
      ja: "成長するほど騒音は大きくなる。圧倒的なウェーブを生き延びなければならない。"
    },
    "loop.s1.name": { ko: "기지 건설", en: "Build the base", zh: "建设基地", ja: "拠点建設" },
    "loop.s1.desc": {
      ko: "HQ를 중심으로 전력을 공급하고 방어 인프라를 구축합니다.",
      en: "Run power out from your HQ and raise the defensive infrastructure around it.",
      zh: "以 HQ 为中心供应电力，并构筑防御设施。",
      ja: "HQ を中心に電力を供給し、防衛インフラを構築します。"
    },
    "loop.s2.name": { ko: "세력 확장", en: "Expand your reach", zh: "扩张势力", ja: "勢力拡大" },
    "loop.s2.desc": {
      ko: "고티어 자원과 연구 포인트를 확보하기 위해 전장을 탐사합니다.",
      en: "Push into the field to secure high-tier resources and research points.",
      zh: "为确保高阶资源与研究点数，探索战场。",
      ja: "高ティア資源と研究ポイントを確保するため、戦場を探索します。"
    },
    "loop.s3.name": { ko: "소음 축적", en: "Noise builds", zh: "噪声累积", ja: "騒音蓄積" },
    "loop.s3.desc": {
      ko: "발전과 전투 수위가 높아질수록 지속 소음 단계가 상승합니다.",
      en: "The further your power and combat escalate, the higher your sustained noise level climbs.",
      zh: "发展与战斗强度越高，持续噪声等级就越上升。",
      ja: "発展と戦闘の水準が上がるほど、持続騒音レベルが上昇します。"
    },
    "loop.s4.name": { ko: "웨이브 방어", en: "Hold the wave", zh: "波次防御", ja: "ウェーブ防衛" },
    "loop.s4.desc": {
      ko: "기지 사방에서 몰려드는 군집 감염체와 보스를 격퇴합니다.",
      en: "Swarming infected and bosses close in on every side of the base.",
      zh: "击退从基地四面涌来的集群感染体与首领。",
      ja: "拠点の四方から押し寄せる群集感染体とボスを撃退します。"
    },
    "loop.s5.name": { ko: "전술 적응", en: "Adapt your tactics", zh: "战术适应", ja: "戦術適応" },
    "loop.s5.desc": {
      ko: "무작위 지형과 직업 조합을 바탕으로 최선의 생존 경로를 재설계합니다.",
      en: "Redraw your best route to survival around random terrain and your class composition.",
      zh: "依据随机地形与职业组合，重新规划最佳生存路径。",
      ja: "ランダムな地形と職業構成をもとに、最適な生存ルートを再設計します。"
    },

    /* ---- FAQ ---- 제목은 ko 키 없음(영문 유지), 하위 내용은 번역 ---- */
    "faq.title": { en: "FAQ", zh: "常见<span class=\"accent\">问题</span>", ja: "よくある<span class=\"accent\">質問</span>" },
    "faq.subtitle": {
      ko: "지금 확실히 말씀드릴 수 있는 것들",
      en: "What we can tell you right now",
      zh: "目前可以确定告诉你的",
      ja: "現時点でお伝えできること"
    },
    "faq.q1": {
      ko: "AeonFall은 어떤 게임인가요?",
      en: "What kind of game is AeonFall?",
      zh: "AeonFall 是什么样的游戏？",
      ja: "AeonFall はどんなゲームですか？"
    },
    "faq.a1": {
      ko: "하드코어 로그라이크 디펜스입니다. 캐릭터를 직접 조종하면서 실시간으로 기지를 짓고 지킵니다.",
      en: "A hardcore roguelike defense game. You control your character directly while you build and defend a base in real time.",
      zh: "一款硬核 Roguelike 塔防。你直接操控角色，同时实时建造并防守基地。",
      ja: "ハードコア・ローグライク・ディフェンスです。キャラクターを直接操作しながら、リアルタイムで拠点を築き守ります。"
    },
    "faq.q2": {
      ko: "소음이 뭔가요?",
      en: "What is noise?",
      zh: "噪声是什么？",
      ja: "騒音とは何ですか？"
    },
    "faq.a2": {
      ko: "당신의 모든 행동은 소음을 만들고, 소음은 감염된 무리를 부릅니다. 확장하면 자원을 얻지만 다음 웨이브가 앞당겨집니다. 그 맞바꿈이 이 게임입니다.",
      en: "Everything you do makes noise, and noise draws the infected horde. Expanding gets you resources and brings the next wave closer. That trade is the game.",
      zh: "你的一切行动都会产生噪声，而噪声会引来受感染的敌群。扩张能带来资源，也会让下一波更早到来。这个取舍就是游戏本身。",
      ja: "あらゆる行動が騒音を生み、騒音は感染した群れを呼びます。拡張すれば資源は得られますが、次のウェーブが近づきます。その取引こそがこのゲームです。"
    },
    "faq.q3": {
      ko: "언제 나오나요?",
      en: "When does it come out?",
      zh: "什么时候发售？",
      ja: "いつ発売されますか？"
    },
    "faq.a3": {
      ko: "2027년입니다. 스팀에서 위시리스트에 담아두시면 출시 당일 알림을 받으실 수 있습니다.",
      en: "2027. Wishlist on Steam and you will hear from us the day it goes live.",
      zh: "2027 年。在 Steam 加入愿望单，发售当天就会收到通知。",
      ja: "2027年です。Steam でウィッシュリストに追加しておくと、発売当日にお知らせが届きます。"
    },
    "faq.q4": {
      ko: "어디서 할 수 있나요?",
      en: "Where can I play it?",
      zh: "在哪里可以玩到？",
      ja: "どこでプレイできますか？"
    },
    "faq.a4": {
      ko: "스팀입니다. 상점 페이지는 이미 열려 있어 지금 위시리스트에 담으실 수 있습니다.",
      en: "On Steam. The store page is open now for wishlisting.",
      zh: "在 Steam。商店页面已经开放，现在就可以加入愿望单。",
      ja: "Steam です。ストアページは公開済みで、今すぐウィッシュリストに追加できます。"
    },
    "faq.q5": {
      ko: "누가 만드나요?",
      en: "Who is making it?",
      zh: "由谁开发？",
      ja: "誰が作っていますか？"
    },
    "faq.a5": {
      ko: "서울의 2인 스튜디오 달라게임즈입니다. AeonFall은 언리얼 엔진 5로 만들고 있고, 에픽 메가그랜트에 선정되었습니다.",
      en: "Dalla Games, a two-person studio in Seoul. AeonFall is built in Unreal Engine 5 and received an Epic MegaGrant.",
      zh: "首尔的两人工作室 Dalla Games。AeonFall 使用虚幻引擎 5 开发，并获得了 Epic MegaGrant。",
      ja: "ソウルの2人スタジオ Dalla Games です。AeonFall は Unreal Engine 5 で開発し、Epic MegaGrant に採択されました。"
    },
    "faq.q6": {
      ko: "실제로 돌아가는 모습을 볼 수 있나요?",
      en: "Can I see it running?",
      zh: "能看到实际运行的样子吗？",
      ja: "実際に動いている様子は見られますか？"
    },
    "faq.a6": {
      ko: "이 페이지 위쪽에 트레일러가 있습니다. 더 긴 영상은 개발이 진행되는 대로 유튜브 채널에 올립니다.",
      en: "The trailer is at the top of this page. Longer footage goes up on our YouTube channel as we go.",
      zh: "本页顶部有预告片。更长的实机影像会随开发进度发布在我们的 YouTube 频道。",
      ja: "このページの上部にトレーラーがあります。より長い映像は開発の進行に合わせて YouTube チャンネルで公開します。"
    },
    "faq.contact": {
      ko: '취재·사업 문의: <a href="mailto:dalla.gamedev@gmail.com">dalla.gamedev@gmail.com</a>',
      en: 'Press or business enquiries: <a href="mailto:dalla.gamedev@gmail.com">dalla.gamedev@gmail.com</a>',
      zh: '媒体与商务咨询：<a href="mailto:dalla.gamedev@gmail.com">dalla.gamedev@gmail.com</a>',
      ja: '取材・ビジネスのお問い合わせ: <a href="mailto:dalla.gamedev@gmail.com">dalla.gamedev@gmail.com</a>'
    },

    /* ---- 하단 HUD ---- 상태 문구(CALM/RISING/HUNTED)는 영문 고정 ---- */
    "hud.cta": {
      ko: "스팀 위시리스트", en: "Wishlist on Steam",
      zh: "加入 Steam 愿望单", ja: "Steam でウィッシュリスト"
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
    /* 태그라인은 data-i18n-html 대상.
       <br class="br-m"> 는 모바일에서만 살아나는 줄바꿈으로, 각 언어에서
       의미가 끊기지 않는 지점(쉼표·접속 지점)에 넣었다. PC에선 한 줄로 이어진다. */
    "tagline": {
      ko: '모든 선택이 의미를 갖고,<br class="br-m"> 모든 실수가 대가를 치르는 게임을 만듭니다.',
      en: 'We build games where every decision matters<br class="br-m"> and every mistake has consequences.',
      zh: '我们打造每个决定都举足轻重、<br class="br-m">每个失误都付出代价的游戏。',
      ja: 'すべての選択に意味があり、<br class="br-m">すべてのミスに代償が伴うゲームを作ります。'
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
