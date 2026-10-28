// =============================================================
// Firebase 연결 준비
// 설정값은 .env(내 컴퓨터)와 Netlify 환경 변수에서 읽습니다.
// 코드에 키를 직접 쓰지 않습니다.
//
// 쓰는 기능: Authentication(Google 로그인), Firestore
// 쓰지 않는 기능: Analytics, Storage, Functions, Hosting
// =============================================================
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * 설정값 정리: 복사하면서 따라 들어온 앞뒤 공백·따옴표·쉼표를 지움
 * 예) "AIza...",  →  AIza...
 */
function clean(value: string | undefined): string {
  return (value ?? '').trim().replace(/^['"]+/, '').replace(/[,;]+$/, '').replace(/['"]+$/, '').trim();
}

const config = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
};

/** .env 에 Firebase 값 4개가 모두 들어 있으면 true */
export const hasFirebaseConfig = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

// 처음 필요할 때 한 번만 연결 (설정값이 없을 때 사이트가 멈추지 않도록)
let app: FirebaseApp | null = null;

function firebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(config);
  }
  return app;
}

export function auth(): Auth {
  return getAuth(firebaseApp());
}

export function db(): Firestore {
  return getFirestore(firebaseApp());
}
