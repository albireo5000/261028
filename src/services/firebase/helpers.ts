// =============================================================
// Firestore 도우미: 목록 나누기(20개씩), 날짜 변환, 오류 문구
// =============================================================
import {
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  query,
  startAfter,
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import type { ListOptions, Page } from '../types';
import { PAGE_SIZE } from '../rules';

// "더 보기"용 마지막 문서를 기억해 둠 (같은 문서를 다시 읽지 않도록)
const cursorCache = new Map<string, DocumentSnapshot>();

/**
 * 정렬·조건을 받아 최대 20개만 읽어 옴.
 * 다음 묶음이 있을지는 "20개를 꽉 채워 받았는가"로 판단 (1개 더 읽지 않아 읽기 절약)
 */
export async function fetchPage<T>(
  col: CollectionReference<DocumentData>,
  constraints: QueryConstraint[],
  options: ListOptions,
  convert: (id: string, data: DocumentData) => T,
): Promise<Page<T>> {
  const size = options.limit ?? PAGE_SIZE;
  const parts = [...constraints];

  if (options.cursor) {
    let last = cursorCache.get(`${col.path}/${options.cursor}`);
    if (!last) last = await getDoc(doc(col, options.cursor)); // 드물게: 기억이 없으면 1개 읽기
    parts.push(startAfter(last));
  }
  parts.push(limitTo(size));

  const snap = await getDocs(query(col, ...parts));
  const items = snap.docs.map((d) => convert(d.id, d.data()));
  const lastDoc = snap.docs[snap.docs.length - 1];
  if (lastDoc) cursorCache.set(`${col.path}/${lastDoc.id}`, lastDoc);

  return { items, nextCursor: snap.docs.length === size && lastDoc ? lastDoc.id : null };
}

/** 날짜 칸이 문자열이든 Firestore 타임스탬프든 ISO 문자열로 바꿈 */
export function toIso(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return (value.toDate() as Date).toISOString();
  }
  return '';
}

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/** Firebase 오류를 알아듣기 쉬운 한국어로 바꿔 다시 던짐 */
export function friendly(err: unknown): never {
  if (err instanceof FirebaseError) {
    const messages: Record<string, string> = {
      'permission-denied': '권한이 없습니다. 승인된 회원인지 확인해 주세요.',
      unavailable: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.',
      'not-found': '글이 삭제되었거나 존재하지 않습니다.',
      'resource-exhausted': '오늘 사용량 한도를 넘었습니다. 내일 다시 시도해 주세요.',
      'failed-precondition': '데이터베이스 색인이 필요합니다. 관리자에게 알려 주세요.',
    };
    console.error(err); // 개발자 도구에서 원래 오류를 볼 수 있게 남김
    throw new Error(messages[err.code] ?? '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
  throw err;
}
