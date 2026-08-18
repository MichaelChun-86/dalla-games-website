# GA4 실데이터 연결 (Cloudflare Worker)

관리자 대시보드(`/dalla-admin-2027`)에 진짜 GA4 숫자를 넣기 위한 중계 서버입니다.
전부 무료이고, 한 번 설정하면 그 뒤로는 손댈 일이 없습니다.

## 왜 이게 필요한가

브라우저는 GA4를 직접 못 읽습니다. 구글이 **서비스 계정 키**를 요구하는데,
그 키를 웹페이지에 넣으면 소스를 여는 누구나 볼 수 있기 때문입니다.

```
관리자 페이지  ──(그냥 요청)──▶  Worker  ──(키로 인증)──▶  GA4
              ◀──(숫자 JSON)──          ◀──(원본 데이터)──
```

키는 Cloudflare에 보관되어 브라우저로 나가지 않습니다.

---

## 1단계 — GA4 속성 ID 찾기 (1분)

**측정 ID(`G-T5S20FRH38`)와 다른 값입니다.** 숫자 9자리입니다.

1. [analytics.google.com](https://analytics.google.com) 접속
2. 좌측 하단 **관리(톱니바퀴)** → **속성 설정** → **속성 세부정보**
3. 우측 상단의 **속성 ID** (예: `481234567`) 복사

---

## 2단계 — 구글 클라우드에서 API 켜고 키 만들기 (5분)

### 2-1. 프로젝트 만들기
1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 상단 프로젝트 선택 → **새 프로젝트** → 이름 `dalla-analytics` → 만들기

### 2-2. API 사용 설정
1. 좌측 메뉴 **API 및 서비스** → **라이브러리**
2. `Google Analytics Data API` 검색 → **사용** 클릭

### 2-3. 서비스 계정 만들기
1. **API 및 서비스** → **사용자 인증 정보**
2. **사용자 인증 정보 만들기** → **서비스 계정**
3. 이름 `ga4-reader` → **만들고 계속하기** → 역할은 비워두고 **완료**

### 2-4. 키 내려받기
1. 방금 만든 서비스 계정 클릭 → **키** 탭
2. **키 추가** → **새 키 만들기** → **JSON** → 만들기
3. JSON 파일이 다운로드됩니다. **이 파일이 곧 열쇠입니다. 절대 공유·업로드 금지.**

JSON 안에서 두 값을 쓸 겁니다:

```json
{
  "client_email": "ga4-reader@dalla-analytics.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n"
}
```

---

## 3단계 — GA4에 그 계정을 읽기 권한으로 초대 (1분)

이걸 빼먹으면 나중에 **403 오류**가 납니다.

1. GA4 → **관리** → **속성 액세스 관리**
2. 우측 상단 **+** → **사용자 추가**
3. 이메일에 위 `client_email` 값 붙여넣기
4. 역할 **뷰어** 선택 → 추가
5. "이메일 알림 보내기"는 꺼도 됩니다

---

## 4단계 — placement 맞춤 측정기준 등록 (1분)

위시리스트 **버튼별** 통계를 보려면 필요합니다. (안 해도 나머지는 다 나옵니다)

1. GA4 → **관리** → **맞춤 정의** → **맞춤 측정기준 만들기**
2. 측정기준 이름 `placement`, 범위 **이벤트**, 이벤트 매개변수 `placement`
3. 저장

> 등록한 시점부터 데이터가 쌓입니다. 과거 데이터는 소급되지 않습니다.

---

## 5단계 — Cloudflare Worker 배포 (5분)

1. [dash.cloudflare.com](https://dash.cloudflare.com) 가입/로그인 (무료)
2. 좌측 **Workers & Pages** → **Create** → **Start with Hello World!** → **Deploy**
3. 배포되면 **Edit code** 클릭
4. 편집기 내용을 전부 지우고 이 폴더의 **`worker.js`** 내용을 통째로 붙여넣기
5. 우측 상단 **Deploy**

주소가 생깁니다. 예: `https://dalla-ga4.your-name.workers.dev`

### 5-1. 변수와 시크릿 넣기

Worker 화면 → **Settings** → **Variables and Secrets**

서비스 계정은 **둘 중 편한 방식**으로 넣으면 됩니다.

**방식 A — JSON 통째로 (권장, 실수가 적음)**

| 이름 | 종류 | 값 |
|---|---|---|
| `GA_PROPERTY_ID` | Text | 1단계의 숫자 9~10자리 |
| `ALLOWED_ORIGIN` | Text | `https://dallagames.com` |
| `GA_SERVICE_ACCOUNT_JSON` | **Secret** | 내려받은 JSON 파일 내용 **전체** (`{` 부터 `}` 까지) |

**방식 B — 두 값 따로**

| 이름 | 종류 | 값 |
|---|---|---|
| `GA4_PROPERTY_ID` | Text | 숫자 9~10자리 |
| `ALLOWED_ORIGIN` | Text | `https://dallagames.com` |
| `SA_CLIENT_EMAIL` | **Secret** | JSON 의 `client_email` 값 |
| `SA_PRIVATE_KEY` | **Secret** | JSON 의 `private_key` 값 (BEGIN/END 줄 포함) |

> Worker 가 두 방식을 모두 인식하므로 하나만 채우면 됩니다.
> 설정이 잘못되면 Worker 주소를 열었을 때 **무엇이 잘못됐는지 한국어로** 표시됩니다.

넣은 뒤 **Deploy**를 한 번 더 눌러야 반영됩니다.

### 5-2. 잘 되는지 확인

브라우저에서 Worker 주소를 그냥 열어보세요.

```
https://dalla-ga4.your-name.workers.dev
```

이런 JSON이 보이면 성공입니다:

```json
{"todayUsers":12,"todayDeltaPct":20,"weekUsers":84,...}
```

`{"error":"..."}` 가 보이면 아래 [문제 해결] 참고.

---

## 6단계 — 대시보드에 연결 (10초)

`dalla-admin-2027/admin.js` 에서 이 한 줄만 채우면 끝입니다.

```js
var API_ENDPOINT = "https://dalla-ga4.your-name.workers.dev";
```

주소를 알려주시면 제가 넣어서 배포해 드리겠습니다.

연결되면 화면 위의 **"샘플 데이터입니다"** 빨간 배너가 자동으로 사라집니다.

---

## 문제 해결

| 증상 | 원인과 해결 |
|---|---|
| `403 ... permission` | 3단계를 안 했거나 이메일 오타. GA4 속성 액세스 관리에서 뷰어로 등록됐는지 확인 |
| `토큰 발급 실패: invalid_grant` | `SA_PRIVATE_KEY` 가 잘렸습니다. BEGIN/END 줄까지 전부 넣으세요 |
| `GA4_PROPERTY_ID 미설정` | 변수 저장 후 **Deploy** 를 안 눌렀습니다 |
| 숫자가 전부 0 | 정상입니다. GA4는 데이터 반영에 최대 24~48시간 걸립니다 |
| 위시리스트 버튼별만 0 | 4단계(맞춤 측정기준)를 안 했거나, 등록 이전 기간입니다 |
| 대시보드에 여전히 샘플 | 6단계 주소를 안 넣었거나 오타. Worker 주소를 직접 열어 JSON 이 나오는지 먼저 확인 |

---

## 비용과 한도

전부 **무료 범위 안**입니다.

- Cloudflare Workers 무료: 하루 10만 요청 (이 대시보드는 하루 몇십 건 수준)
- GA4 Data API 무료: 하루 25,000 토큰 (한 번 열 때 9건 조회)

Worker가 결과를 **5분간 캐시**하므로 새로고침을 연타해도 GA4를 계속 호출하지 않습니다.

## 보안 메모

- 서비스 계정 키는 Cloudflare secret 에만 있고 브라우저로 나가지 않습니다.
- Worker 는 `ALLOWED_ORIGIN` 의 페이지에서만 브라우저 호출을 허용합니다.
  다만 `curl` 같은 도구로 직접 부르는 것까지는 막지 못합니다.
  노출되는 것은 **집계된 숫자뿐**이고 개인정보는 없습니다.
- 더 조이려면 Cloudflare **Zero Trust → Access** 무료 플랜으로
  Worker 와 관리자 페이지 모두에 구글 로그인을 걸 수 있습니다.
