// =============================================================
// 권한 문지기: 허락된 역할이 아니면 안내 문구를 보여 주고 내용을 숨깁니다.
// 예) <RequireRole allow={['member', 'admin']}> 토론 화면 </RequireRole>
//
// ※ 화면에서 숨기는 것은 1차 방어입니다. Firebase 연결 후에는
//   Firestore 보안 규칙이 서버에서 데이터 자체를 막아 줍니다.
// =============================================================
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../services';
import { Loading, Notice } from './Status';

interface Props {
  allow: Role[];
  children: ReactNode;
}

export default function RequireRole({ allow, children }: Props) {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="로그인 상태를 확인하는 중입니다…" />;
  if (allow.includes(role)) return <>{children}</>;

  if (role === 'guest') {
    return (
      <Notice title="로그인이 필요합니다">
        <p>토론 공간은 승인된 연구실 회원만 볼 수 있습니다.</p>
        <Link to={`/login?next=${encodeURIComponent(location.pathname)}`} className="btn-primary mt-5 inline-block">
          로그인하러 가기
        </Link>
      </Notice>
    );
  }

  if (role === 'pending') {
    return (
      <Notice title="교수님의 승인을 기다리는 중입니다">
        <p>승인이 끝나면 토론 공간을 이용할 수 있습니다. 승인이 늦어지면 교수님께 문의해 주세요.</p>
      </Notice>
    );
  }

  return <Notice title="이 페이지를 볼 권한이 없습니다" />;
}
