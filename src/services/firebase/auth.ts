// =============================================================
// Firebase 로그인 (Google 계정)
//
// 역할 정하는 방법
//  1. Google로 로그인한다.
//  2. Firestore members/{이메일} 문서를 1개 읽는다.
//  3. 문서가 있고 role 이 'admin' → 교수, 그 밖의 값 → 승인 회원
//     문서가 없거나 이메일 인증이 안 된 계정 → 승인 대기(pending)
// =============================================================
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import type { AuthService, UserProfile } from '../types';
import { auth, db } from './app';

const listeners = new Set<(user: UserProfile | null) => void>();
let current: UserProfile | null = null;
let ready = false; // 첫 로그인 상태 확인이 끝났는가
let started = false;
let version = 0; // 늦게 도착한 응답이 최신 상태를 덮어쓰지 않도록

async function toProfile(user: User): Promise<UserProfile> {
  const email = user.email ?? '';
  const base = { uid: user.uid, email, displayName: user.displayName || email };
  if (!email || !user.emailVerified) return { ...base, role: 'pending' };
  try {
    const snap = await getDoc(doc(db(), 'members', email));
    if (!snap.exists()) return { ...base, role: 'pending' };
    const data = snap.data();
    return {
      ...base,
      displayName: (typeof data.displayName === 'string' && data.displayName) || base.displayName,
      role: data.role === 'admin' ? 'admin' : 'member',
    };
  } catch (err) {
    console.error('승인 명단을 읽지 못했습니다.', err);
    return { ...base, role: 'pending' };
  }
}

function emit(user: UserProfile | null) {
  current = user;
  ready = true;
  listeners.forEach((fn) => fn(user));
}

// 로그인 상태 감시는 사이트 전체에서 한 번만 시작
function start() {
  if (started) return;
  started = true;
  onAuthStateChanged(auth(), async (user) => {
    const mine = ++version;
    const profile = user ? await toProfile(user) : null;
    if (mine === version) emit(profile);
  });
}

/** 지정한 사용자의 역할 확인이 끝날 때까지 기다림 (로그인 직후 화면 깜빡임 방지) */
function waitFor(uid: string | null): Promise<void> {
  return new Promise((resolve) => {
    if (ready && (current?.uid ?? null) === uid) return resolve();
    const fn = (u: UserProfile | null) => {
      if ((u?.uid ?? null) === uid) {
        listeners.delete(fn);
        resolve();
      }
    };
    listeners.add(fn);
  });
}

export const firebaseAuthService: AuthService = {
  onAuthChange(callback) {
    start();
    listeners.add(callback);
    if (ready) callback(current);
    return () => {
      listeners.delete(callback);
    };
  },

  async signIn() {
    start();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' }); // 계정 고르기 창을 항상 보여 줌
    try {
      const result = await signInWithPopup(auth(), provider);
      await waitFor(result.user.uid);
    } catch (err) {
      // 팝업이 막힌 브라우저에서는 페이지 이동 방식으로 다시 시도
      if (err instanceof FirebaseError && err.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth(), provider);
        return;
      }
      // 사용자가 창을 닫은 경우는 오류로 보지 않음
      if (err instanceof FirebaseError && (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request')) {
        throw new Error('로그인 창이 닫혔습니다.');
      }
      throw err;
    }
  },

  async signOut() {
    await fbSignOut(auth());
    await waitFor(null);
  },
};
