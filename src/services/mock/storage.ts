// =============================================================
// mock 전용 도우미: localStorage 읽기·쓰기, 목록 나누기, 지연
// =============================================================
import type { ListOptions, Page } from '../types';
import { PAGE_SIZE } from '../rules';

// localStorage 저장 이름 (앞에 붙인 "lab.mock." 으로 다른 사이트 데이터와 구분)
export const STORAGE_KEYS = {
  session: 'lab.mock.session',
  posts: 'lab.mock.posts',
  comments: 'lab.mock.comments',
} as const;

/** 저장된 값을 읽음. 없거나 깨졌거나 브라우저가 막으면 기본값 */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** 값을 저장함. 브라우저가 막아도 사이트는 계속 동작하게 오류를 삼킴 */
export function save<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 시크릿 창 등에서 저장이 안 될 수 있음. 이 경우 새로고침하면 초기화됨
  }
}

export function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 무시
  }
}

/** 실제 서버처럼 약간 기다렸다가 응답 (로딩 화면 확인용) */
export function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 이미 정렬된 배열을 20개씩 잘라 돌려줌. cursor는 "다음 시작 위치" */
export function paginate<T>(all: T[], options: ListOptions = {}): Page<T> {
  const limit = options.limit ?? PAGE_SIZE;
  const start = options.cursor ? Number(options.cursor) || 0 : 0;
  const items = all.slice(start, start + limit);
  const next = start + limit;
  return { items, nextCursor: next < all.length ? String(next) : null };
}

/** 겹치지 않는 간단한 id 만들기 */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 원본이 바뀌지 않도록 복사본을 돌려줌 */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
