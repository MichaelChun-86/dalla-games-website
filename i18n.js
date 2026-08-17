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

    /* ---- 히어로 트레일러 파사드 위 문구 ---- */
    "video.watch": {
      ko: "트레일러 영상 보기",
      en: "WATCH TRAILER",
      zh: "观看预告片",
      ja: "トレーラーを見る"
    },

    /* ---- OUR GAMES ---- 제목은 ko 키 없음(영문 유지), 하위 내용은 번역 ---- */
    "games.title": {
      en: 'OUR <span class="accent">GAME</span>',
      zh: '我们的<span class="accent">游戏</span>',
      ja: '私たちの<span class="accent">ゲーム</span>'
    },
    "games.subtitle": {
      ko: "AeonFall – 하드코어 로그라이크 디펜스",
      en: "AeonFall – Hardcore Roguelike Defense",
      zh: "AeonFall – 硬核 Roguelike 塔防",
      ja: "AeonFall – ハードコア・ローグライク・ディフェンス"
    },
    "f1.title": { ko: "하이브리드 컨트롤", en: "Hybrid Control", zh: "混合操控", ja: "ハイブリッド操作" },
    "f1.desc": {
      ko: "전략 디펜스와 캐릭터 직접 조작의 결합. 실시간 전략과 세밀한 전투를 동시에 다뤄야 합니다.",
      en: "Strategic defense fused with direct character control. You have to handle real-time strategy and fine-grained combat at once.",
      zh: "策略防守与角色直接操控的结合。你必须同时驾驭实时策略与精细战斗。",
      ja: "戦略ディフェンスとキャラクターの直接操作の融合。リアルタイム戦略と繊細な戦闘を同時にこなす必要があります。"
    },
    "f2.title": { ko: "소음이 부르는 위협", en: "Noise-Driven Threat", zh: "噪声引发的威胁", ja: "騒音が招く脅威" },
    "f2.desc": {
      ko: "자원 파밍과 전투 등 모든 행동이 소음을 만듭니다. 무분별한 확장은 감당하기 힘든 거대한 웨이브로 이어집니다.",
      en: "Every action makes noise — farming resources, fighting, all of it. Expand carelessly and it leads to a wave far bigger than you can handle.",
      zh: "采集资源、战斗等一切行动都会产生噪声。盲目扩张将招来你无法承受的巨大敌潮。",
      ja: "資源の採集や戦闘など、すべての行動が騒音を生みます。無分別な拡張は、手に負えない巨大なウェーブにつながります。"
    },
    "f3.title": { ko: "압도적인 물량", en: "Massive Waves", zh: "海量敌潮", ja: "圧倒的な物量" },
    "f3.desc": {
      ko: "화면을 가득 메우는 웨이브와 거대 보스의 공세. 단순한 화력만으로는 버틸 수 없는 수적 열세를 극복해야 합니다.",
      en: "Waves that fill the screen, and the assault of colossal bosses. You have to overcome odds that raw firepower alone cannot hold back.",
      zh: "铺满整个画面的敌潮，以及巨型首领的攻势。你必须克服单靠火力无法抵挡的数量劣势。",
      ja: "画面を埋め尽くすウェーブと巨大ボスの攻勢。単純な火力だけでは耐えられない数的劣勢を乗り越えなければなりません。"
    },
    "f4.title": { ko: "다이내믹 생존", en: "Dynamic Survival", zh: "动态生存", ja: "ダイナミックな生存" },
    "f4.desc": {
      ko: "매 판 달라지는 지형, 자원, 직업 빌드. 정해진 정답 없이 매번 새로운 생존 경로를 개척해야 합니다.",
      en: "Terrain, resources and class builds change every run. There is no set answer — you carve out a new route to survival each time.",
      zh: "地形、资源与职业流派每局都不同。没有固定的正解，每次都要开辟全新的生存路径。",
      ja: "毎回変わる地形、資源、職業ビルド。決まった正解はなく、そのたびに新しい生存ルートを切り開く必要があります。"
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
      ko: "캐릭터를 직접 조작해 자원을 모으고 기지를 확장하며, 수십만 감염체 속에서 끝까지 살아남아야 하는 하드코어 로그라이크 디펜스입니다.",
      en: "A hardcore roguelike defense game. You control your character directly, gathering resources and expanding your base while surviving hundreds of thousands of infected to the very end.",
      zh: "一款硬核 Roguelike 塔防。你直接操控角色采集资源、扩建基地，在数十万感染体的围攻中撑到最后。",
      ja: "ハードコア・ローグライク・ディフェンスです。キャラクターを直接操作して資源を集め、拠点を拡張しながら、数十万の感染体の中を最後まで生き延びます。"
    },
    "faq.q2": {
      ko: "'소음' 시스템이 핵심인가요?",
      en: "Is the noise system the core of it?",
      zh: "“噪声”系统是核心吗？",
      ja: "「騒音」システムが核心ですか？"
    },
    "faq.a2": {
      ko: "네. 채굴, 건설, 전투 등 모든 행동이 소음을 냅니다. 기지가 커지고 강해질수록 더 시끄러워지고, 그만큼 더 많은 적이 몰려옵니다. 이 위험과 보상의 줄타기가 핵심입니다.",
      en: "Yes. Mining, building, fighting — every action makes noise. The bigger and stronger your base gets, the louder it becomes, and the more enemies come for you. Walking that line between risk and reward is the heart of the game.",
      zh: "是的。采矿、建造、战斗，所有行动都会产生噪声。基地越大越强就越吵，涌来的敌人也越多。在风险与收益之间走钢丝，正是本作的核心。",
      ja: "はい。採掘、建設、戦闘など、すべての行動が騒音を生みます。拠点が大きく強くなるほど騒がしくなり、その分だけ多くの敵が押し寄せます。このリスクとリターンの綱渡りが核心です。"
    },
    "faq.q3": {
      ko: "기존 디펜스 게임과 뭐가 다른가요?",
      en: "How is this different from other defense games?",
      zh: "与其他塔防游戏有什么不同？",
      ja: "既存のディフェンスゲームと何が違いますか？"
    },
    "faq.a3": {
      ko: "유일한 생존자를 직접 조작하며 살아남아야 합니다. 또한 다음 공격의 규모를 정하는 건 단순 타이머가 아니라 당신이 발생시킨 소음입니다.",
      en: "You directly control the lone survivor and have to stay alive yourself. And what sets the scale of the next attack is not a simple timer — it is the noise you made.",
      zh: "你要直接操控唯一的幸存者活下去。而决定下一波攻击规模的不是简单的计时器，而是你制造的噪声。",
      ja: "唯一の生存者を直接操作して生き延びなければなりません。さらに次の攻撃の規模を決めるのは単純なタイマーではなく、あなたが出した騒音です。"
    },
    "faq.q4": {
      ko: "적은 얼마나 몰려오나요?",
      en: "How many enemies are there?",
      zh: "敌人会有多少？",
      ja: "敵はどれくらい押し寄せますか？"
    },
    "faq.a4": {
      ko: "맵 전체에 수십만 마리의 감염체가 실시간으로 움직입니다. 주기적인 웨이브는 물론, 마지막 날에는 전 방향에서 보스와 함께 쏟아집니다.",
      en: "Hundreds of thousands of infected move across the whole map in real time. Waves come on a cycle, and on the final day they pour in from every direction with a boss.",
      zh: "数十万感染体在整张地图上实时移动。除了周期性的波次，最后一天它们还会从四面八方随首领一同涌来。",
      ja: "マップ全体を数十万体の感染体がリアルタイムで動き回ります。周期的なウェーブはもちろん、最終日には全方向からボスと共に押し寄せます。"
    },
    "faq.q5": {
      ko: "매 판 플레이가 달라지나요?",
      en: "Is every run different?",
      zh: "每局的玩法都不同吗？",
      ja: "毎回プレイは変わりますか？"
    },
    "faq.a5": {
      ko: "지형, 자원 배치, 둥지 위치, 보스 종류와 공격 방향까지 매번 무작위로 바뀝니다. 보스 특성에 맞춰 실시간으로 빌드를 짜야 합니다.",
      en: "Terrain, resource placement, nest locations, boss types and the directions they attack from are randomised every time. You have to build to counter the boss you drew, in real time.",
      zh: "地形、资源分布、巢穴位置、首领种类与进攻方向每次都会随机变化。你必须根据抽到的首领特性实时调整流派。",
      ja: "地形、資源配置、巣の位置、ボスの種類と攻撃方向まで毎回ランダムに変わります。ボスの特性に合わせてリアルタイムでビルドを組む必要があります。"
    },
    "faq.q6": {
      ko: "난이도는 많이 어렵나요?",
      en: "Is it very hard?",
      zh: "难度很高吗？",
      ja: "難易度はかなり高いですか？"
    },
    "faq.a6": {
      ko: "네, 굉장히 어렵게 만들고 있습니다. 산소나 체력이 바닥나거나 본진이 밀리면 즉시 끝납니다. 수많은 실패를 겪으며 공략법을 찾아가도록 설계했습니다.",
      en: "Yes, we are making it very hard. If your oxygen or health runs out, or your base is overrun, it ends immediately. It is designed so that you find the answers through many failures.",
      zh: "是的，我们正把它做得非常难。氧气或体力耗尽、主基地被攻破，都会立刻结束。我们刻意让玩家在无数次失败中摸索出攻略。",
      ja: "はい、非常に難しく作っています。酸素や体力が尽きるか、本拠地が落ちれば即終了です。数多くの失敗を重ねて攻略法を見つけていく設計です。"
    },
    "faq.q7": {
      ko: "출시 일정과 플랫폼은 어떻게 되나요?",
      en: "When does it come out, and on what?",
      zh: "发售时间和平台是？",
      ja: "発売時期とプラットフォームは？"
    },
    "faq.a7": {
      ko: "2027년 스팀 얼리 액세스로 먼저 출시합니다. 찜하기(위시리스트)를 눌러두시면 소식을 가장 빠르게 받아보실 수 있습니다. 콘솔은 PC 출시 후 순차적으로 검토할 예정입니다.",
      en: "Steam Early Access first, in 2027. Add it to your wishlist and you will hear the news first. Console is planned for review in stages after the PC release.",
      zh: "2027 年先以 Steam 抢先体验推出。加入愿望单即可第一时间收到消息。主机版将在 PC 版发售后分阶段评估。",
      ja: "2027年、まず Steam 早期アクセスでリリースします。ウィッシュリストに追加していただければ、いち早く情報をお届けします。コンソールは PC 版の後に順次検討する予定です。"
    },
    "faq.q8": {
      ko: "개발팀은 어떤 팀인가요?",
      en: "Who is making it?",
      zh: "开发团队是怎样的？",
      ja: "開発チームはどんなチームですか？"
    },
    "faq.a8": {
      ko: "16년 차 아트 디렉터와 13년 차 풀스택 개발자, 둘이서 만들고 있는 인디 스튜디오 달라게임즈입니다. 에픽 메가그랜트에 선정되었으며 언리얼 엔진 5로 제작 중입니다. 소규모 팀이지만, 타협 없이 저희 스스로 즐길 수 있는 게임을 만들고 있습니다.",
      en: "Dalla Games, a two-person indie studio: an art director with 16 years of experience and a full-stack developer with 13. We were selected for an Epic MegaGrant and are building it in Unreal Engine 5. We are a small team, but we are making a game we can enjoy ourselves, without compromise.",
      zh: "达拉游戏（Dalla Games）是一家两人独立工作室，由从业 16 年的美术总监和 13 年的全栈开发者组成。我们入选了 Epic MegaGrant，正使用虚幻引擎 5 开发。团队虽小，但我们不做妥协，只做自己也想玩的游戏。",
      ja: "16年目のアートディレクターと13年目のフルスタック開発者の2人で作るインディースタジオ、Dalla Games です。Epic MegaGrant に選出され、Unreal Engine 5 で制作しています。少人数ですが、妥協せず自分たち自身が楽しめるゲームを作っています。"
    },
    "faq.q9": {
      ko: "실제 플레이 모습도 볼 수 있나요?",
      en: "Can I see actual gameplay?",
      zh: "能看到实际游玩画面吗？",
      ja: "実際のプレイ映像も見られますか？"
    },
    "faq.a9": {
      ko: "페이지 상단 트레일러에서 확인하실 수 있습니다. 게임 플레이 영상은 공식 유튜브를 통해 꾸준히 공유할 계획입니다.",
      en: "There is a trailer at the top of this page. We plan to keep sharing gameplay footage on our official YouTube channel.",
      zh: "页面顶部的预告片中即可看到。我们也计划通过官方 YouTube 持续分享游玩影像。",
      ja: "ページ上部のトレーラーでご覧いただけます。ゲームプレイ映像は公式 YouTube で継続的に共有していく予定です。"
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
