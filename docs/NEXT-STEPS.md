# 배포 후 할 일 체크리스트

Firebase 연결 코드는 이미 들어가 있습니다. 사이트는 이렇게 동작합니다.

- Firebase 설정값 4개가 **있으면** → 실제 Google 로그인 + Firestore
- 설정값이 **없으면** → 가짜(목) 데이터 + `개발용` 로그인 버튼

각 단계가 끝나면 `[ ]` 를 `[x]` 로 바꿔 표시해 두세요.

## 1단계. Firebase 프로젝트 (완료)
- [x] 프로젝트 만들기 (무료 Spark 요금제, 결제 카드 등록 안 함)
- [x] Authentication > 로그인 방법 > **Google** 사용 설정
- [x] Authentication > 설정 > **승인된 도메인**에 Netlify 주소 추가
- [x] Firestore 데이터베이스 만들기

## 2단계. 보안 규칙 게시 ← 지금 할 일
지금은 Firestore가 모든 읽기를 막고 있어서 연구 목록도 안 보입니다.
- [ ] Firebase 콘솔 > Firestore Database > **규칙(Rules)** 탭
- [ ] 원래 있던 내용을 모두 지우고 `docs/firestore-rules.draft.rules` 파일 내용을 통째로 붙여 넣기
- [ ] **게시** 클릭

## 3단계. 교수님 본인을 관리자로 등록
- [ ] Firestore Database > 데이터 > **컬렉션 시작** > 컬렉션 ID: `members`
- [ ] 문서 ID: 교수님 Google 이메일 (**소문자 그대로**, 예: `professor@gmail.com`)
- [ ] 필드 추가
  - `role` (string) = `admin`
  - `displayName` (string) = 사이트에 보일 이름 (예: `홍길동 교수`)
- [ ] 사이트에서 Google 로그인 → 상단 바에 `교수` 배지가 보이면 성공

## 4단계. 연구·수업 자료 입력 (콘솔에서 직접)
지금은 관리자 편집 화면이 없어서 Firebase 콘솔에서 넣습니다. 형식은 `src/data/seed.ts` 와 같습니다.

**`research` 컬렉션** (문서 ID는 "자동 ID")
| 필드 | 형식 | 예 |
|---|---|---|
| `title` | string | 대학 신입생의 학업적 자기효능감과 … |
| `summary` | string | 연구 요약 |
| `authors` | array (항목은 string) | 연구책임자, 대학원생 A |
| `year` | number | 2026 |
| `tags` | array (항목은 string) | 중도탈락, 대학생활적응 |
| `links` | array (항목은 map: `label` string, `url` string) | 논문 원문 / https://… |
| `createdAt` | string | `2026-09-15T09:00:00.000Z` (이 값으로 최신순 정렬) |

**`teaching` 컬렉션**
| 필드 | 형식 | 예 |
|---|---|---|
| `course` | string | 교육심리학 |
| `semester` | string | `2026-2학기` (이 형식을 지켜야 최신 학기 순으로 정렬됨) |
| `title` | string | 1주차 강의 자료 |
| `description` | string | 설명 |
| `url` | string | Google Drive 공유 링크 (`https://` 로 시작) |

- [ ] 연구 1건 이상 입력 → 사이트 홈·연구 화면에 보이는지 확인
- [ ] 수업 자료 1건 이상 입력 → 수업 자료 화면 확인
- [ ] 연구 화면에서 태그를 처음 누르면 "색인이 필요합니다"라는 안내가 뜰 수 있습니다.
      브라우저 개발자 도구(F12) > Console 에 나온 **링크를 눌러 색인을 만들고** 몇 분 기다리면 해결됩니다.

## 5단계. Netlify에 설정값 넣기
코드에는 키를 넣지 않았습니다. Netlify가 빌드할 때 읽어 가게 해야 합니다.
- [ ] Netlify > 사이트 > Site configuration > **Environment variables** > Add a variable
- [ ] 아래 4개를 각각 등록 (값은 Firebase 콘솔 > 프로젝트 설정 > 내 앱에서 복사)
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
- [ ] Deploys > **Trigger deploy > Deploy site** (환경 변수는 다시 배포해야 적용됨)
- [ ] 배포된 사이트의 로그인 화면에 `개발용` 버튼 대신 **Google 계정으로 로그인** 버튼이 보이면 성공
- [ ] 내 컴퓨터에서도 Firebase로 실행하려면 `.env.example` 을 복사해 `.env` 로 저장하고 값 4개 입력

## 6단계. 회원 승인 운영
- [ ] 대학원생에게 사이트에서 Google 로그인을 한 번 하라고 안내 (승인 대기 화면이 보이면 정상)
- [ ] Firestore `members` 에 그 학생의 이메일(소문자)로 문서 추가, `role` = `member`, `displayName` = 이름
- [ ] 학생이 새로고침하면 토론이 보이는지 확인
- [ ] 졸업·탈퇴한 학생은 `members` 문서를 지우면 바로 접근이 막힘

## 7단계. 점검
- [ ] 로그아웃 상태(또는 시크릿 창)로 토론 글 주소를 직접 열어 내용이 안 보이는지 확인
- [ ] 첫 한 달은 매주 Firebase 콘솔 > Firestore > **사용량** 확인 (읽기 하루 5만 회 한도)
- [ ] (권장) Google Cloud 콘솔 > API 및 서비스 > 사용자 인증 정보 > 브라우저 키 > "웹사이트 제한"에 Netlify 주소 등록

## 이번 MVP에 없는 기능 (다음에 만들 것)
- 연구·수업 자료를 사이트 안에서 추가·수정하는 관리자 화면 (지금은 Firebase 콘솔에서 직접 입력)
- 회원 승인 화면 (지금은 Firebase 콘솔에서 직접 입력)
- 새 글·댓글 알림
- 파일 업로드 (무료 요금제 제약으로 외부 링크만 사용)
