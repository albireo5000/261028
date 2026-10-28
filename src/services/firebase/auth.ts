// =============================================================
// Firebase 로그인 (Google 계정)
//
// 역할 정하는 방법
//  1. Google로 로그인한다.
//  2. Firestore members/{이메일} 문서를 1개 읽는다.
//  3. 문서가 있고 role 이 'admin' → 교수, 그 밖의 값 → 승인 회원
//     문서가 없거나 이메일 인증이 안 된 계정 → 승인 대기(pending)
// =============================================================
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
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

// 로그인 실패 이유를 쉬운 말로 (화면에 오류 코드도 함께 보여 줌)
const signInMessages: Record<string, string> = {
  'auth/popup-blocked': '브라우저가 로그인 창(팝업)을 막았습니다. 주소창 오른쪽의 팝업 차단 표시를 눌러 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.',
  'auth/popup-closed-by-user': '로그인 창이 닫혔습니다. 다시 눌러 Google 계정을 선택해 주세요.',
  'auth/cancelled-popup-request': '로그인 창이 닫혔습니다. 다시 눌러 주세요.',
  'auth/unauthorized-domain': '이 사이트 주소가 Firebase에 등록되지 않았습니다. Firebase 콘솔 > Authentication > 설정 > 승인된 도메인을 확인해 주세요.',
  'auth/operation-not-allowed': 'Firebase에서 Google 로그인이 꺼져 있습니다. Authentication > 로그인 방법에서 Google을 사용 설정해 주세요.',
  'auth/network-request-failed': '인터넷 연결이 끊겼거나 Google 서버에 접속하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  'auth/invalid-api-key': 'Firebase 설정값(API 키)이 잘못되었습니다. Netlify 환경 변수를 확인해 주세요.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase 설정값(API 키)이 잘못되었습니다. Netlify 환경 변수를 확인해 주세요.',
  'auth/too-many-requests': '시도가 너무 많습니다. 몇 분 뒤 다시 시도해 주세요.',
  'auth/web-storage-unsupported': '브라우저가 로그인 정보를 저장하지 못합니다. 시크릿 모드를 끄거나 다른 브라우저로 열어 주세요.',
  'auth/internal-error': '로그인 중 오류가 났습니다. 브라우저를 새로고침한 뒤 다시 시도해 주세요.',
};

function signInError(err: unknown): Error {
  if (err instanceof FirebaseError) {
    console.error('로그인 실패', err);
    // 웹사이트 제한을 걸어 둔 API 키에서 생기는 오류
    if (err.code.startsWith('auth/requests-from-referer')) {
      return new Error(`API 키가 이 사이트 주소를 허용하지 않습니다. Google Cloud 콘솔의 API 키 "웹사이트 제한"을 확인해 주세요. (오류 코드: ${err.code})`);
    }
    const message = signInMessages[err.code] ?? '로그인하지 못했습니다.';
    return new Error(`${message} (오류 코드: ${err.code})`);
  }
  return err instanceof Error ? err : new Error('로그인하지 못했습니다.');
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
    // 팝업 방식만 씀. (페이지 이동 방식은 Netlify 주소에서 최신 브라우저가 막는 경우가 많음)
    let uid: string;
    try {
      const result = await signInWithPopup(auth(), provider);
      uid = result.user.uid;
    } catch (err) {
      throw signInError(err);
    }
    await waitFor(uid);
  },

  async signOut() {
    await fbSignOut(auth());
    await waitFor(null);
  },
};
