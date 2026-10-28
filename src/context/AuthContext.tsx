// =============================================================
// 로그인 상태를 사이트 전체에 나눠 주는 곳
// 어느 화면에서든 useAuth() 를 부르면 현재 사용자와 역할을 알 수 있습니다.
// =============================================================
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, roleOf, type Role, type UserProfile } from '../services';

interface AuthState {
  /** 로그인한 사용자. 로그인 안 했으면 null */
  user: UserProfile | null;
  /** 역할 (로그인 안 했으면 'guest') */
  role: Role;
  /** 처음 로그인 상태를 확인하는 중이면 true */
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, role: 'guest', loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인 상태가 바뀔 때마다 user 값을 새로 고침
    const unsubscribe = authService.onAuthChange((next) => {
      setUser(next);
      setLoading(false);
    });
    return unsubscribe; // 화면이 사라지면 알림 해제
  }, []);

  const value = useMemo(() => ({ user, role: roleOf(user), loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
