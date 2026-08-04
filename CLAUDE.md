# 달라게임즈 홈페이지 프로젝트

## 대화 규칙
- 모든 답변과 설명은 한국어로 한다.

## 프로젝트 개요
- 달라게임즈(Dalla Games Inc.)의 공식 홈페이지를 새로 제작한다.
- 기존 사이트는 Blazor(.NET)로 만들어져 모바일에서 레이아웃이 깨진다.
- 이번에는 **순수 HTML / CSS / JavaScript** 로 다시 구현한다.
- 기존 디자인은 최대한 그대로 유지하되, **모바일 반응형(어떤 화면에서도 안 깨짐)** 이 가장 중요한 목표다.

## 기술 스택 (반드시 지킬 것)
- 순수 HTML, CSS, JavaScript만 사용한다. 빌드 과정이 필요 없는 정적 사이트로 만든다.
- Blazor, React 등 프레임워크는 사용하지 않는다.
- GitHub Pages에 그대로 올려서 바로 배포 가능한 구조로 만든다.
- 데스크톱과 모바일 모두에서 완벽하게 보이도록 반응형으로 작성한다.
- 코드는 초보자도 이해할 수 있게 깔끔하게 쓰고, 주석을 충분히 단다.

## 디자인 시스템
### 색상
- 배경: 검정 (#000000 ~ 아주 어두운 회색)
- 강조색: 네온/민트 그린 (정확한 값은 첨부 스크린샷에서 추출할 것)
- 본문 텍스트: 흰색
- 로고 아이콘: 골드/옐로우

### 분위기
- 다크 사이파이(sci-fi), 하드코어, 시네마틱.
- 하프톤 도트 패턴, 글리치/디스트레스 텍스처 느낌.

### 폰트
- 폰트 파일은 `Font/` 폴더에 있다. `@font-face`로 직접 불러서 사용한다(웹폰트 CDN 사용 안 함).
  - `Font/esamanru Light.ttf` (이사만루 라이트)
  - `Font/esamanru Medium.ttf` (이사만루 미디움)
  - `Font/NotoSansKR-Bold.ttf` (노토산스 KR Bold)
- **기본(본문/메뉴/소제목 등 거의 모든 텍스트)**: 이사만루 라이트.
- **이사만루 미디움**으로 작성할 곳 (강조용, 딱 3곳):
  1. Epic MegaGrant 녹색 제목
  2. OUR GAMES 제목
  3. ABOUT US 제목
- **노토산스(NotoSansKR-Bold)**: 푸터 카피라이트의 `©` 문자만. (이사만루체는 `©` 글리프를 지원하지 않으므로 그 글자 하나만 폰트를 바꿔서 처리한다.)
- 타이틀(AeonFall)은 폰트가 아니라 `1-BI.png` 로고 이미지를 그대로 사용한다.

## 브라우저 탭 (파비콘 / 타이틀)
- 크롬 등 브라우저 탭에 표시되는 아이콘으로 `images/0-탭 CI.png`(달라게임즈 다이아몬드 심볼)를 파비콘으로 지정한다.
  - `<link rel="icon" ...>` 로 연결한다.
- 탭에 표시되는 페이지 제목(`<title>`)은 **DALLA GAMES** 로 한다. (`reference/0-탭 래퍼런스.png` 참고: 탭에 아이콘 + "DALLA GAMES" 텍스트가 나오는 모습)

## 페이지 구조 (한 페이지 스크롤 방식)

### 1. 헤더 / 네비게이션
- 좌측: DALLA GAMES 로고 (다이아몬드 아이콘 + 글자)
- 우측 메뉴: Home / Games / About / Contact
- 모바일에서는 메뉴를 햄버거 버튼으로 접을 것.

### 2. 히어로 (첫 화면)
- 배경: 우주복 캐릭터 키 비주얼 이미지를 **히어로 화면 전체에 배경 이미지처럼** 깐다.
  - 이미지 원본 해상도: 2533 × 1261
  - 우측에 따로 배치하는 것이 아니라, 화면 가운데에 꽉 차게 배경으로 깐다.
  - 화면 크기가 달라져도 비율이 자연스럽게 유지되도록 한다(예: `background-size: cover`, `background-position: center`).
- 배경 위에 올라가는 요소:
  - 큰 타이틀: AeonFall
  - 부제: Wishlist Now
  - 버튼: "Wishlist Now" Steam 버튼
    - 기본 상태와 마우스 호버 상태 이미지가 **각각 따로** 있다.
    - 마우스를 올리면(hover) **노란색 버튼 이미지로 바뀐다.**
    - 마우스를 떼면 다시 기본 이미지로 돌아온다.
  - Epic MegaGrant 배지 + 문구:
    "Epic Games' support is helping us accelerate development of AeonFall."

### 3. OUR GAMES
- 제목: OUR GAMES
- 소제목: AeonFall – Hardcore Roguelike Defense
- 왼쪽: 게임 키아트 이미지
- 오른쪽: 4가지 특징 (제목은 그린, 본문은 흰색)
  - **Massive Waves**
    Face relentless hordes at a scale that pushes your limits.
    Every battle is a fight against overwhelming numbers.
  - **Noise-Driven Threat**
    Every action you take generates noise — and noise brings death.
    Expand carefully, or trigger unstoppable waves.
  - **Hybrid Control**
    Directly control your character while building and defending your base in real time.
    Balance action and strategy to survive.
  - **Dynamic Survival**
    Each run unfolds differently with shifting terrain, resources, and enemy patterns.
    Adapt or be overwhelmed.

### 4. ABOUT US
- 제목: ABOUT US
- 소제목: DALLA GAMES INC.
- 팀 멤버 2명 (사진 + 이름 + 역할)
  - **CEO JOONYOUNG CHUN** — Lead Artist / Concept Designer
  - **CTO YUNKYU KIM** — Lead Programmer / Lead Game Designer
- 태그라인:
  "We build games where every decision matters and every mistake has consequences."

### 5. 푸터
- 소셜 아이콘 3개 (각각 아래 링크로 연결)
  - 이메일 → dalla.gamedev@gmail.com
  - 유튜브 → https://www.youtube.com/watch?v=ZuPX2S99tBM
  - 스팀 → https://store.steampowered.com/app/4582730/THE_AEON_FALL/
- 저작권 문구:
  "AeonFall™ © 2026 DALLA GAMES INC. ALL RIGHTS RESERVED."

## 이미지 / 리소스
- **`reference/` 폴더**: 기존 사이트의 스크린샷이 들어 있다. 디자인·레이아웃을 똑같이 맞추기 위한 **시각적 참고용**이다. 이 스크린샷 자체를 사이트에 넣지는 않는다.
- **`images/` 폴더**: 사이트에 실제로 사용할 이미지 파일들이 들어 있다.
  - 아이콘은 SVG, 키아트/배경은 jpg 또는 png.
  - 히어로 배경 이미지: 우주복 캐릭터 키 비주얼 (2533 × 1261).
  - 스팀 버튼 이미지는 2개다 — 기본 상태용, 마우스 호버 시 노란색으로 바뀌는 용.
  - Epic MegaGrant 배지: `images/Epic_MegaGrants_Recipient_logo.png` (녹색 육각형 배지).
  - 파비콘(탭 아이콘): `images/0-탭 CI.png`.
- **파일명 규칙**: 한글/공백이 들어간 이미지 파일명은 GitHub Pages에서 깨질 수 있으므로, 코드에서 쓰기 전에 영문 파일명으로 바꿔서 사용한다(원본은 보존). 예: `1-타이틀 이미지_컷 버전.png` → `hero-bg.png`, `2-게임 소개 이미지.png` → `game-art.png`, `0-탭 CI.png` → `favicon.png` 등.
- 작업 시 `reference/` 의 스크린샷을 보고 디자인을 맞추되, 실제 사용 이미지는 `images/` 폴더의 파일을 쓴다.
- 파일 이름이 헷갈리면 시작 전에 어떤 파일이 무엇인지 질문할 것.

## 외부 링크
- Steam 위시리스트: https://store.steampowered.com/app/4582730/THE_AEON_FALL/
- 참고용 기존 사이트: https://dalla-game.github.io/aeonfall-showcase/
- 유튜브: https://www.youtube.com/watch?v=ZuPX2S99tBM
- 이메일: dalla.gamedev@gmail.com

## 작업 규칙
- 작업 중에는 데스크톱과 모바일 화면을 모두 확인하면서 진행한다.
- 어떤 단계든 시작 전에 무엇을 할지 먼저 알려주고 진행한다.
- 모르는 부분은 임의로 추측하지 말고 질문한다.
