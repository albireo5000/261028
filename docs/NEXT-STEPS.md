# 배포 후 할 일 체크리스트

지금 사이트는 **가짜(목) 데이터**로 돌아갑니다. 아래 순서대로 하면 실제 로그인과 데이터베이스가 붙습니다.
각 단계는 끝나면 `[ ]` 를 `[x]` 로 바꿔 표시해 두세요.

## 1단계. 먼저 배포해서 화면 확인 (README 참고)
- [ ] GitHub에 코드를 올린다
- [ ] Netlify에 연결해 배포한다
- [ ] 배포된 주소에서 모든 메뉴, 새로고침, 개발용 로그인 3종을 확인한다

## 2단계. Firebase 프로젝트 만들기 (무료 Spark 요금제)
- [ ] https://console.firebase.google.com 에서 "프로젝트 추가"
- [ ] Google 애널리틱스는 꺼도 됨
- [ ] 요금제가 **Spark(무료)** 인지 확인. 결제 카드를 등록하지 않는다
- [ ] 프로젝트 설정 > 내 앱 > 웹 앱(</>) 추가 → 설정값 4개(apiKey, authDomain, projectId, appId)를 메모

## 3단계. Google 로그인 켜기
- [ ] Authentication > 시작하기 > 로그인 방법 > **Google** 사용 설정
- [ ] Authentication > 설정 > **승인된 도메인**에 Netlify 주소 추가 (예: `my-lab.netlify.app`)
- [ ] 전화번호 로그인 등 다른 방식은 켜지 않는다

## 4단계. Firestore 만들기
- [ ] Firestore Database > 데이터베이스 만들기 > 위치는 `asia-northeast3 (서울)` 권장 > **프로덕션 모드**
- [ ] `docs/firestore-rules.draft.rules` 내용을 규칙(Rules) 탭에 붙여 넣고 게시
- [ ] 규칙 플레이그라운드에서 "비로그인 사용자가 posts 읽기 → 거부"를 확인
- [ ] `members` 컬렉션을 만들고, 문서 ID에 **교수님 본인 Google 이메일**, 필드 `role` = `admin`, `displayName` = 이름 입력
- [ ] 연구·수업 자료를 `research`, `teaching` 컬렉션에 직접 입력 (`src/data/seed.ts` 형식 참고)

## 5단계. 비밀 키 넣기 (코드에 직접 쓰지 않음)
- [ ] 내 컴퓨터: `.env.example` 을 복사해 `.env` 로 저장하고 값 4개 입력 (`.env` 는 GitHub에 올라가지 않음)
- [ ] Netlify: Site configuration > Environment variables 에 같은 이름 4개 등록

## 6단계. Firebase 코드 연결 (개발 도움 필요)
- [ ] `npm install firebase`
- [ ] `src/services/firebase/` 폴더에 `types.ts` 의 4개 인터페이스를 Firestore로 구현
  - 로그인 후 `members/{이메일}` 문서가 없으면 역할 `pending`
  - 목록은 20개씩, 실시간 구독은 댓글(`watchComments`)만
  - 글 삭제 시 댓글을 먼저 지우고 글을 지움
- [ ] `src/services/index.ts` 의 `export * from './mock';` 한 줄을 `export * from './firebase';` 로 바꿈
- [ ] 로그인 화면에 "Google 계정으로 로그인" 버튼이 나오는지 확인 (개발용 버튼은 자동으로 사라짐)

## 7단계. 회원 승인 운영
- [ ] 대학원생에게 사이트에서 Google 로그인을 한 번 하라고 안내 (승인 대기 화면이 보이면 정상)
- [ ] Firestore `members` 에 그 학생의 이메일로 문서 추가, `role` = `member`
- [ ] 학생이 새로고침하면 토론이 보이는지 확인
- [ ] 졸업·탈퇴한 학생은 `members` 문서를 지우면 바로 접근이 막힘

## 8단계. 점검
- [ ] 첫 한 달은 매주 Firebase 콘솔 > Firestore > 사용량 확인 (읽기 하루 5만 회 한도)
- [ ] 다른 브라우저(로그아웃 상태)로 토론 글 주소를 직접 열어 내용이 안 보이는지 확인

## 이번 MVP에 없는 기능 (다음에 만들 것)
- 연구·수업 자료를 사이트 안에서 추가·수정하는 관리자 화면 (지금은 Firebase 콘솔에서 직접 입력)
- 회원 승인 화면 (지금은 Firebase 콘솔에서 직접 입력)
- 새 글·댓글 알림
- 파일 업로드 (무료 요금제 제약으로 외부 링크만 사용)
