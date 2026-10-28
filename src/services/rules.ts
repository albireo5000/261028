// =============================================================
// 권한·길이 규칙
// 화면과 서비스가 같은 규칙을 쓰도록 한 곳에 모았습니다.
// (docs/firestore-rules.draft.rules 의 서버 규칙과 내용을 맞춰 두세요)
// =============================================================
import type { Role, UserProfile } from './types';

/** 한 번에 불러오는 목록 개수 (Firestore 읽기 절약) */
export const PAGE_SIZE = 20;

/** 글자 수 제한 */
export const LIMITS = {
  postTitle: 100,
  postBody: 5000,
  commentBody: 5000,
} as const;

/** 로그인하지 않았으면 'guest' */
export function roleOf(user: UserProfile | null): Role {
  return user ? user.role : 'guest';
}

/** 토론을 읽고 쓸 수 있는가: 승인 회원 또는 교수 */
export function canUseDiscussion(user: UserProfile | null): boolean {
  const role = roleOf(user);
  return role === 'member' || role === 'admin';
}

/** 이 글·댓글을 지울 수 있는가: 작성자 본인 또는 교수 */
export function canDelete(user: UserProfile | null, authorUid: string): boolean {
  if (!user || !canUseDiscussion(user)) return false;
  return user.role === 'admin' || user.uid === authorUid;
}
