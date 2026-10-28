// =============================================================
// 서비스 입구 (화면은 반드시 이 파일에서만 서비스를 가져옵니다)
//
// ▶ 지금: mock(가짜 데이터) 구현을 씁니다.
// ▶ Firebase 연결 후: 아래 한 줄을 './firebase' 로 바꾸면 됩니다.
//      export * from './firebase';
//
// [Firestore 무료(Spark) 한도 절약 원칙 — Firebase 구현 때 꼭 지킬 것]
//  1. 하루 읽기 5만 회, 쓰기 2만 회가 한도입니다.
//  2. 목록은 한 번에 20개씩만 읽습니다 (rules.ts 의 PAGE_SIZE, limit + startAfter 사용).
//  3. 실시간 리스너(onSnapshot)는 쓰지 않습니다.
//     예외: 지금 열려 있는 토론 글 1개의 댓글(watchComments)만 허용합니다.
//     화면을 벗어나면 반드시 구독을 해제합니다.
//  4. 글의 댓글 수는 commentCount 필드로 저장해, 목록에서 댓글을 따로 세지 않습니다.
//  5. 연구 태그 목록은 config/site.ts 에 두어 데이터베이스를 읽지 않습니다.
//  6. 파일 업로드(Cloud Storage)와 Cloud Functions는 쓰지 않습니다. 자료는 외부 링크만 저장합니다.
// =============================================================
export * from './mock';
export * from './rules';
export type * from './types';
