// =============================================================
// mock 토론 서비스
// 글과 댓글을 localStorage에 저장해 새로고침 후에도 남게 합니다.
// 권한 검사는 rules.ts의 규칙을 그대로 씁니다.
// (Firebase 단계에서는 Firestore 보안 규칙이 서버에서 한 번 더 막아 줍니다.)
// =============================================================
import type { Comment, DiscussionPost, DiscussionService, UserProfile } from '../types';
import { LIMITS, canDelete, canUseDiscussion } from '../rules';
import { seedComments, seedPosts } from '../../data/seed';
import { STORAGE_KEYS, clone, delay, load, newId, paginate, save } from './storage';

// ---------- 저장소 읽기·쓰기 ----------
// 처음 방문이면 샘플 글을 넣어 둠
function readPosts(): DiscussionPost[] {
  return load<DiscussionPost[]>(STORAGE_KEYS.posts, seedPosts);
}
function writePosts(posts: DiscussionPost[]) {
  save(STORAGE_KEYS.posts, posts);
}
function readComments(): Comment[] {
  return load<Comment[]>(STORAGE_KEYS.comments, seedComments);
}
function writeComments(comments: Comment[]) {
  save(STORAGE_KEYS.comments, comments);
}

// ---------- 실시간 댓글 구독 흉내 ----------
// Firestore의 onSnapshot 대신, 댓글이 바뀌면 직접 알려 줌
const commentWatchers = new Map<string, Set<(comments: Comment[]) => void>>();

function commentsOf(postId: string): Comment[] {
  return readComments()
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // 오래된 댓글이 위
}

function notifyComments(postId: string) {
  const list = commentsOf(postId);
  commentWatchers.get(postId)?.forEach((fn) => fn(clone(list)));
}

// ---------- 공통 검사 ----------
function assertMember(user: UserProfile) {
  if (!canUseDiscussion(user)) throw new Error('승인된 회원만 이용할 수 있습니다.');
}

function cleanText(value: string, max: number, label: string): string {
  const text = value.trim();
  if (!text) throw new Error(`${label}을(를) 입력해 주세요.`);
  if (text.length > max) throw new Error(`${label}은(는) ${max}자 이내로 써 주세요.`);
  return text;
}

// ---------- 서비스 구현 ----------
export const mockDiscussionService: DiscussionService = {
  async listPosts(options = {}) {
    await delay();
    const sorted = readPosts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return clone(paginate(sorted, options));
  },

  async getPost(id) {
    await delay();
    const found = readPosts().find((p) => p.id === id);
    return found ? clone(found) : null;
  },

  async createPost(input, author) {
    await delay();
    assertMember(author);
    const post: DiscussionPost = {
      id: newId('p'),
      title: cleanText(input.title, LIMITS.postTitle, '제목'),
      body: cleanText(input.body, LIMITS.postBody, '본문'),
      ...(input.researchId ? { researchId: input.researchId } : {}),
      authorUid: author.uid,
      authorName: author.displayName,
      createdAt: new Date().toISOString(),
      commentCount: 0,
    };
    writePosts([post, ...readPosts()]);
    return clone(post);
  },

  async deletePost(postId, actor) {
    await delay();
    const post = readPosts().find((p) => p.id === postId);
    if (!post) return;
    if (!canDelete(actor, post.authorUid)) throw new Error('이 글을 삭제할 권한이 없습니다.');
    writePosts(readPosts().filter((p) => p.id !== postId));
    writeComments(readComments().filter((c) => c.postId !== postId));
    notifyComments(postId);
  },

  watchComments(postId, callback) {
    if (!commentWatchers.has(postId)) commentWatchers.set(postId, new Set());
    commentWatchers.get(postId)!.add(callback);
    // 처음 한 번은 바로 현재 댓글을 보냄 (서버 응답처럼 약간 늦게)
    const timer = setTimeout(() => callback(clone(commentsOf(postId))), 120);
    return () => {
      clearTimeout(timer);
      commentWatchers.get(postId)?.delete(callback);
    };
  },

  async addComment(postId, body, author) {
    await delay();
    assertMember(author);
    const posts = readPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('글이 삭제되었거나 존재하지 않습니다.');
    const comment: Comment = {
      id: newId('c'),
      postId,
      body: cleanText(body, LIMITS.commentBody, '댓글'),
      authorUid: author.uid,
      authorName: author.displayName,
      createdAt: new Date().toISOString(),
    };
    writeComments([...readComments(), comment]);
    post.commentCount += 1;
    writePosts(posts);
    notifyComments(postId);
    return clone(comment);
  },

  async deleteComment(postId, commentId, actor) {
    await delay();
    const comment = readComments().find((c) => c.id === commentId && c.postId === postId);
    if (!comment) return;
    if (!canDelete(actor, comment.authorUid)) throw new Error('이 댓글을 삭제할 권한이 없습니다.');
    writeComments(readComments().filter((c) => c.id !== commentId));
    const posts = readPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      writePosts(posts);
    }
    notifyComments(postId);
  },
};
