// =============================================================
// 데이터 모양(타입)과 서비스 약속(인터페이스)
//
// 화면은 아래 인터페이스만 보고 데이터를 요청합니다.
// 지금은 mock(가짜) 구현이 이 약속을 지키고,
// 나중에는 Firebase 구현이 같은 약속을 지키게 만들면
// 화면 코드는 한 줄도 바꾸지 않아도 됩니다.
// =============================================================

// ---------- 데이터 타입 ----------

/**
 * 사용자 등급
 * - guest: 로그인하지 않음
 * - pending: 로그인했지만 교수님 승인 전
 * - member: 승인된 대학원생
 * - admin: 교수(관리자)
 */
export type Role = 'guest' | 'pending' | 'member' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface Research {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  year: number;
  tags: string[];
  links: { label: string; url: string }[];
  createdAt: string; // ISO 날짜 문자열 (예: 2026-03-01T09:00:00.000Z)
}

export interface TeachingMaterial {
  id: string;
  course: string;
  semester: string;
  title: string;
  description: string;
  url: string; // 외부 링크만 저장 (Google Drive 공유 링크 등). 파일 업로드는 하지 않음
}

export interface DiscussionPost {
  id: string;
  title: string;
  body: string;
  researchId?: string; // 관련 연구(선택)
  authorUid: string;
  authorName: string;
  createdAt: string;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  body: string;
  authorUid: string;
  authorName: string;
  createdAt: string;
}

// ---------- 목록 조회 공통 ----------

/** 목록을 나눠 받을 때 쓰는 옵션 */
export interface ListOptions {
  /** 한 번에 받을 개수. 기본 20 (Firestore 읽기 횟수 절약) */
  limit?: number;
  /** "더 보기"를 누를 때 이전 응답의 nextCursor를 그대로 넘김 */
  cursor?: string | null;
}

/** 나눠 받은 목록 한 묶음 */
export interface Page<T> {
  items: T[];
  /** 다음 묶음이 있으면 값이 있고, 없으면 null */
  nextCursor: string | null;
}

// ---------- 서비스 인터페이스 ----------

export interface AuthService {
  /** 로그인 상태가 바뀔 때마다 알려 줌. 반환값을 호출하면 알림 해제 */
  onAuthChange(callback: (user: UserProfile | null) => void): () => void;

  /** 실제 로그인 (Firebase 단계에서 Google 로그인으로 구현) */
  signIn(): Promise<void>;

  /**
   * 개발용 로그인. mock 구현에만 있습니다.
   * 이 함수가 있으면 로그인 화면에 역할별 버튼 3개가 나타납니다.
   */
  devSignIn?: (role: Exclude<Role, 'guest'>) => Promise<void>;

  signOut(): Promise<void>;
}

export interface ResearchService {
  /** 연구 목록 (최신순). tag를 주면 그 태그가 달린 연구만 */
  list(options?: ListOptions & { tag?: string }): Promise<Page<Research>>;
  /** 연구 1건. 없으면 null */
  get(id: string): Promise<Research | null>;
}

export interface TeachingService {
  /** 수업 자료 목록 (최신 학기 먼저) */
  list(options?: ListOptions): Promise<Page<TeachingMaterial>>;
}

/** 새 글 쓸 때 화면에서 넘기는 값 */
export interface NewPostInput {
  title: string;
  body: string;
  researchId?: string;
}

export interface DiscussionService {
  /** 토론 글 목록 (최신순) */
  listPosts(options?: ListOptions): Promise<Page<DiscussionPost>>;
  /** 토론 글 1건. 없으면 null */
  getPost(id: string): Promise<DiscussionPost | null>;
  /** 글쓰기. 만들어진 글을 돌려줌 */
  createPost(input: NewPostInput, author: UserProfile): Promise<DiscussionPost>;
  /** 글 삭제 (작성자 본인 또는 admin). 달린 댓글도 함께 삭제 */
  deletePost(postId: string, actor: UserProfile): Promise<void>;

  /**
   * 열려 있는 글 1개의 댓글을 실시간으로 받아 봄.
   * 반환값을 호출하면 구독 해제. (실시간 구독은 이 함수 하나만 허용)
   */
  watchComments(postId: string, callback: (comments: Comment[]) => void): () => void;
  /** 댓글 쓰기 */
  addComment(postId: string, body: string, author: UserProfile): Promise<Comment>;
  /** 댓글 삭제 (작성자 본인 또는 admin) */
  deleteComment(postId: string, commentId: string, actor: UserProfile): Promise<void>;
}
