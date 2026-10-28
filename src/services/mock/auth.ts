// =============================================================
// mock 로그인: 버튼 하나로 교수/승인 회원/미승인 회원이 됩니다.
// 로그인 상태는 localStorage에 저장돼 새로고침해도 유지됩니다.
// 실제 비밀번호는 전혀 다루지 않습니다.
// =============================================================
import type { AuthService, UserProfile } from '../types';
import { seedUsers } from '../../data/seed';
import { STORAGE_KEYS, delay, load, remove, save } from './storage';

// 로그인 상태가 바뀌면 알려 줄 대상들
const listeners = new Set<(user: UserProfile | null) => void>();

function current(): UserProfile | null {
  return load<UserProfile | null>(STORAGE_KEYS.session, null);
}

function notify(user: UserProfile | null) {
  listeners.forEach((fn) => fn(user));
}

export const mockAuthService: AuthService = {
  onAuthChange(callback) {
    listeners.add(callback);
    callback(current()); // 처음 한 번은 바로 현재 상태를 알려 줌
    return () => {
      listeners.delete(callback);
    };
  },

  async signIn() {
    // mock에는 Google 로그인이 없으므로 승인 회원으로 로그인시킴
    await this.devSignIn?.('member');
  },

  async devSignIn(role) {
    await delay();
    const user = seedUsers[role];
    save(STORAGE_KEYS.session, user);
    notify(user);
  },

  async signOut() {
    await delay();
    remove(STORAGE_KEYS.session);
    notify(null);
  },
};
