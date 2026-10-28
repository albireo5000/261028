// =============================================================
// 샘플 데이터 (모두 가상의 내용입니다)
// 실제 인물·기관명은 쓰지 않았습니다. Firebase를 연결하면 이 파일은
// 처음 데이터를 넣을 때 참고용으로만 쓰고, 화면에서는 쓰지 않습니다.
// =============================================================
import type { Comment, DiscussionPost, Research, TeachingMaterial, UserProfile } from '../services/types';

// ---------- 개발용 가상 사용자 3명 ----------
export const seedUsers: Record<'admin' | 'member' | 'pending', UserProfile> = {
  admin: {
    uid: 'mock-admin',
    email: 'professor@example.com',
    displayName: '교수 (개발용)',
    role: 'admin',
  },
  member: {
    uid: 'mock-member',
    email: 'student-a@example.com',
    displayName: '대학원생 A',
    role: 'member',
  },
  pending: {
    uid: 'mock-pending',
    email: 'student-b@example.com',
    displayName: '대학원생 B',
    role: 'pending',
  },
};

// ---------- 연구 3건 ----------
export const seedResearch: Research[] = [
  {
    id: 'r1',
    title: '대학 신입생의 학업적 자기효능감과 중도탈락 의도의 관계: 대학생활적응의 매개효과',
    summary:
      '가상의 4년제 대학 신입생 412명을 대상으로 학업적 자기효능감이 중도탈락 의도에 미치는 영향을 분석했습니다. 대학생활적응이 두 변인 사이를 부분 매개하는 것으로 나타났으며, 1학기 초 적응 지원 프로그램의 필요성을 논의했습니다.',
    authors: ['연구책임자', '대학원생 A'],
    year: 2026,
    tags: ['중도탈락', '대학생활적응'],
    links: [
      { label: '논문 원문(예시 링크)', url: 'https://example.com/papers/r1' },
      { label: '발표 자료(예시 링크)', url: 'https://example.com/slides/r1' },
    ],
    createdAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'r2',
    title: '기초수학 보충 프로그램 참여가 수학불안과 학업성취에 미치는 효과',
    summary:
      '기초학력 진단에서 수학 영역 하위 집단으로 분류된 학생들이 8주간 소그룹 보충 프로그램에 참여한 뒤, 수학불안은 낮아지고 전공 기초과목 성취는 높아졌습니다. 사전-사후 비교와 통제집단 비교 결과를 함께 제시합니다.',
    authors: ['연구책임자', '대학원생 B'],
    year: 2025,
    tags: ['기초학력', '수학불안'],
    links: [{ label: '보고서(예시 링크)', url: 'https://example.com/reports/r2' }],
    createdAt: '2025-12-01T09:00:00.000Z',
  },
  {
    id: 'r3',
    title: '자기결정성 이론에 기반한 비교과 프로그램의 자발적 참여 요인 탐색',
    summary:
      '비교과 학습 프로그램에 자발적으로 참여한 학생과 그렇지 않은 학생을 면담해 자율성·유능감·관계성 욕구가 참여 결정에 어떻게 작용하는지 질적으로 분석했습니다.',
    authors: ['연구책임자'],
    year: 2025,
    tags: ['학습동기', '기초학력'],
    links: [{ label: '학회 발표 초록(예시 링크)', url: 'https://example.com/abstracts/r3' }],
    createdAt: '2025-06-20T09:00:00.000Z',
  },
];

// ---------- 수업 자료 4건 ----------
export const seedTeaching: TeachingMaterial[] = [
  {
    id: 't1',
    course: '교육심리학',
    semester: '2026-2학기',
    title: '1주차 강의 자료: 학습이론 개관',
    description: '행동주의, 인지주의, 구성주의 학습이론을 비교한 강의 슬라이드입니다.',
    url: 'https://example.com/drive/edu-psych-week1',
  },
  {
    id: 't2',
    course: '교육심리학',
    semester: '2026-2학기',
    title: '과제 안내: 학습동기 사례 분석',
    description: '자기결정성 이론을 적용해 실제 수업 장면 하나를 분석하는 과제입니다.',
    url: 'https://example.com/drive/edu-psych-assignment',
  },
  {
    id: 't3',
    course: '교육연구방법론',
    semester: '2026-1학기',
    title: '매개효과 분석 실습 자료',
    description: '가상 데이터로 매개효과를 분석하는 실습 안내서와 예제 데이터 링크입니다.',
    url: 'https://example.com/drive/research-methods-mediation',
  },
  {
    id: 't4',
    course: '대학생 학습전략 세미나',
    semester: '2025-2학기',
    title: '학습습관 점검표',
    description: '학생이 스스로 학습 시간 관리와 복습 습관을 점검하는 양식입니다.',
    url: 'https://example.com/drive/study-habit-checklist',
  },
];

// ---------- 토론 글 2건 + 댓글 ----------
export const seedPosts: DiscussionPost[] = [
  {
    id: 'p1',
    title: '매개효과 분석 결과 해석에 대해 의견 부탁드립니다',
    body:
      '대학생활적응의 부분 매개효과가 나왔는데, 간접효과 크기가 생각보다 작습니다.\n학년별로 나눠서 다시 보는 게 좋을지, 아니면 조절된 매개로 모형을 바꾸는 게 좋을지 의견 주세요.',
    researchId: 'r1',
    authorUid: seedUsers.member.uid,
    authorName: seedUsers.member.displayName,
    createdAt: '2026-10-20T10:30:00.000Z',
    commentCount: 1,
  },
  {
    id: 'p2',
    title: '다음 학기 기초수학 프로그램 설계 아이디어 모음',
    body:
      '이번 학기 참여 학생 면담에서 "부담이 적어야 오게 된다"는 말이 많았습니다.\n짧은 회차, 게임 요소, 또래 튜터 등 아이디어가 있으면 댓글로 남겨 주세요.',
    authorUid: seedUsers.admin.uid,
    authorName: seedUsers.admin.displayName,
    createdAt: '2026-10-25T14:00:00.000Z',
    commentCount: 0,
  },
];

export const seedComments: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    body: '학년별로 먼저 나눠 보고, 차이가 크면 그때 조절된 매개 모형을 검토해 봅시다.',
    authorUid: seedUsers.admin.uid,
    authorName: seedUsers.admin.displayName,
    createdAt: '2026-10-21T09:15:00.000Z',
  },
];
