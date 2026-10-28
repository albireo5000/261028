// =============================================================
// Firestore 토론 서비스 (posts, posts/{postId}/comments)
//
// 읽기 절약
//  - 글 목록은 20개씩, 댓글 수는 commentCount 필드로 표시
//  - 실시간 구독(onSnapshot)은 열린 글의 댓글(watchComments)에만 사용
// 권한은 화면에서 먼저 확인하고, Firestore 보안 규칙이 서버에서 한 번 더 막습니다.
// =============================================================
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import type { Comment, DiscussionPost, DiscussionService, UserProfile } from '../types';
import { LIMITS, canDelete, canUseDiscussion } from '../rules';
import { db } from './app';
import { fetchPage, friendly, str, toIso } from './helpers';

function toPost(id: string, d: DocumentData): DiscussionPost {
  return {
    id,
    title: str(d.title),
    body: str(d.body),
    ...(typeof d.researchId === 'string' && d.researchId ? { researchId: d.researchId } : {}),
    authorUid: str(d.authorUid),
    authorName: str(d.authorName, '알 수 없음'),
    createdAt: toIso(d.createdAt),
    commentCount: typeof d.commentCount === 'number' ? d.commentCount : 0,
  };
}

function toComment(id: string, d: DocumentData): Comment {
  return {
    id,
    postId: str(d.postId),
    body: str(d.body),
    authorUid: str(d.authorUid),
    authorName: str(d.authorName, '알 수 없음'),
    createdAt: toIso(d.createdAt),
  };
}

function assertMember(user: UserProfile) {
  if (!canUseDiscussion(user)) throw new Error('승인된 회원만 이용할 수 있습니다.');
}

function cleanText(value: string, max: number, label: string): string {
  const text = value.trim();
  if (!text) throw new Error(`${label}을(를) 입력해 주세요.`);
  if (text.length > max) throw new Error(`${label}은(는) ${max}자 이내로 써 주세요.`);
  return text;
}

const posts = () => collection(db(), 'posts');
const comments = (postId: string) => collection(db(), 'posts', postId, 'comments');

// 한 번에 지울 수 있는 문서 수 (Firestore 일괄 작업 한도 500보다 여유 있게)
const BATCH_SIZE = 400;

export const firebaseDiscussionService: DiscussionService = {
  async listPosts(options = {}) {
    try {
      return await fetchPage(posts(), [orderBy('createdAt', 'desc')], options, toPost);
    } catch (err) {
      return friendly(err);
    }
  },

  async getPost(id) {
    try {
      const snap = await getDoc(doc(posts(), id));
      return snap.exists() ? toPost(snap.id, snap.data()) : null;
    } catch (err) {
      return friendly(err);
    }
  },

  async createPost(input, author) {
    assertMember(author);
    const data = {
      title: cleanText(input.title, LIMITS.postTitle, '제목'),
      body: cleanText(input.body, LIMITS.postBody, '본문'),
      ...(input.researchId ? { researchId: input.researchId } : {}), // 빈 값은 아예 저장하지 않음
      authorUid: author.uid,
      authorName: author.displayName,
      createdAt: new Date().toISOString(),
      commentCount: 0,
    };
    try {
      const ref = await addDoc(posts(), data);
      return { id: ref.id, ...data };
    } catch (err) {
      return friendly(err);
    }
  },

  async deletePost(postId, actor) {
    try {
      const snap = await getDoc(doc(posts(), postId));
      if (!snap.exists()) return;
      if (!canDelete(actor, str(snap.data().authorUid))) throw new Error('이 글을 삭제할 권한이 없습니다.');

      // Cloud Functions를 쓰지 않으므로 댓글을 먼저 지우고 마지막에 글을 지움
      const all = await getDocs(comments(postId));
      for (let i = 0; i < all.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db());
        all.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      const last = writeBatch(db());
      last.delete(doc(posts(), postId));
      await last.commit();
    } catch (err) {
      return friendly(err);
    }
  },

  watchComments(postId, callback) {
    // 오래된 댓글이 위로
    const q = query(comments(postId), orderBy('createdAt', 'asc'));
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => toComment(d.id, d.data()))),
      (err) => {
        console.error('댓글을 불러오지 못했습니다.', err);
        callback([]);
      },
    );
  },

  async addComment(postId, body, author) {
    assertMember(author);
    const data = {
      postId,
      body: cleanText(body, LIMITS.commentBody, '댓글'),
      authorUid: author.uid,
      authorName: author.displayName,
      createdAt: new Date().toISOString(),
    };
    try {
      // 댓글 저장과 댓글 수 +1 을 한 번에 (둘 중 하나만 되는 일이 없도록)
      const ref = doc(comments(postId));
      const batch = writeBatch(db());
      batch.set(ref, data);
      batch.update(doc(posts(), postId), { commentCount: increment(1) });
      await batch.commit();
      return { id: ref.id, ...data };
    } catch (err) {
      return friendly(err);
    }
  },

  async deleteComment(postId, commentId, actor) {
    try {
      const ref = doc(comments(postId), commentId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      if (!canDelete(actor, str(snap.data().authorUid))) throw new Error('이 댓글을 삭제할 권한이 없습니다.');
      const batch = writeBatch(db());
      batch.delete(ref);
      batch.update(doc(posts(), postId), { commentCount: increment(-1) });
      await batch.commit();
    } catch (err) {
      return friendly(err);
    }
  },
};
