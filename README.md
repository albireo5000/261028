# 연구실 홈페이지

연구 성과·수업 자료를 정리하고, 승인된 대학원생과 연구 결과를 토론하는 사이트입니다.
지금은 **가짜(목) 데이터**로 동작하는 MVP이며, 나중에 Firebase(Google 로그인 + Firestore)를 연결합니다.

- 사이트 이름·소개 문구·연구 태그 바꾸기: `src/config/site.ts`
- 샘플 데이터: `src/data/seed.ts` (모두 가상의 내용)
- 배포 후 할 일: `docs/NEXT-STEPS.md`

---

## 1. 내 컴퓨터에서 실행하기

### 준비물 (처음 한 번)
1. **Node.js 22** 설치: https://nodejs.org 에서 "LTS" 버전을 내려받아 설치합니다.
2. 설치 확인: 터미널(맥은 "터미널", 윈도우는 "명령 프롬프트")을 열고 아래를 입력합니다. `v22...` 처럼 나오면 됩니다.

```bash
node -v
```

### 실행
터미널에서 이 프로젝트 폴더로 이동한 뒤, 아래 두 명령을 차례로 입력합니다.

```bash
npm install
```

```bash
npm run dev
```

화면에 나오는 주소(보통 `http://localhost:5173`)를 브라우저에서 엽니다. 끄려면 터미널에서 `Ctrl + C`.

### 권한별 화면 확인
상단 **로그인** → `개발용` 버튼 3개 중 하나를 누릅니다.

| 버튼 | 토론 | 삭제 |
|---|---|---|
| (로그인 안 함) | "로그인이 필요합니다" 안내 | - |
| 미승인 회원 | "교수님의 승인을 기다리는 중" 안내 | - |
| 승인 회원 | 읽기·글쓰기·댓글 | 본인 글·댓글만 |
| 교수 | 읽기·글쓰기·댓글 | 모든 글·댓글 |

쓴 글과 로그인 상태는 브라우저에 저장돼 새로고침해도 남습니다.
처음 상태로 돌리려면 브라우저 개발자 도구 > Application > Local Storage 에서 `lab.mock.`으로 시작하는 항목을 지웁니다.

### 배포 전 점검 명령
```bash
npm run build
```
오류 없이 `dist` 폴더가 만들어지면 배포할 준비가 된 것입니다.

---

## 2. GitHub에 올리기

1. https://github.com 에 로그인 → 오른쪽 위 `+` → **New repository**
2. 이름 입력(예: `lab-homepage`) → **Private** 선택 권장 → README 추가는 체크하지 않음 → **Create repository**
3. 터미널에서 프로젝트 폴더로 이동해 아래를 차례로 입력합니다. (`내아이디`와 저장소 이름은 본인 것으로)

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "첫 업로드"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/내아이디/lab-homepage.git
```

```bash
git push -u origin main
```

> `.env`(실제 키 파일)와 `node_modules`는 `.gitignore`에 들어 있어 자동으로 올라가지 않습니다.

이후 수정할 때는 `git add .` → `git commit -m "무엇을 바꿨는지"` → `git push` 세 줄이면 됩니다.

---

## 3. Netlify에 연결하기 (무료)

1. https://app.netlify.com 에 **GitHub 계정으로** 가입·로그인
2. **Add new site** → **Import an existing project** → **GitHub** 선택
3. 방금 만든 저장소 선택 (안 보이면 "Configure Netlify on GitHub"에서 저장소 접근 허용)
4. 설정 화면은 그대로 둡니다. `netlify.toml` 파일이 아래 값을 자동으로 채웁니다.
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Deploy** 클릭 → 1~2분 뒤 `https://무작위이름.netlify.app` 주소가 생깁니다.
6. 주소 이름 바꾸기: Site configuration > **Change site name**

이제 GitHub에 `git push` 할 때마다 Netlify가 자동으로 다시 배포합니다.
`/research/r1` 같은 주소에서 새로고침해도 404가 나지 않도록 `netlify.toml`에 설정해 두었습니다.

---

## 4. 폴더 구조

```
src/
  config/site.ts        사이트 이름·소개·태그 (여기만 고치면 됨)
  components/           화면 부품 (상단 바, 카드, 태그 필터, 권한 문지기 등)
  pages/                페이지 (홈, 연구, 수업 자료, 토론, 로그인, 404)
  services/
    types.ts            데이터 모양과 서비스 약속(인터페이스)
    rules.ts            권한·글자 수 규칙
    index.ts            ★ 서비스 입구. Firebase 연결 시 이 파일 한 줄만 바꿈
    mock/               가짜 데이터 구현 (localStorage 저장)
  data/seed.ts          샘플 데이터
  context/AuthContext.tsx  로그인 상태 공유
docs/
  firestore-rules.draft.rules  Firestore 보안 규칙 초안
  firestore-data-model.md      데이터 구조와 읽기 횟수 예상
  NEXT-STEPS.md                배포 후 체크리스트
```

## 5. 지켜야 할 원칙
- 화면(`pages`, `components`)은 `src/services`에서만 데이터를 가져옵니다.
- Firebase는 무료 요금제(Spark)만 씁니다. Cloud Functions, Cloud Storage(파일 업로드), Firebase Hosting은 쓰지 않습니다.
- 자료 파일은 Google Drive 등에 올리고 **링크만** 저장합니다.
- API 키는 코드에 쓰지 않고 `.env`와 Netlify 환경 변수에만 넣습니다.
