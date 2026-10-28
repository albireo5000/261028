// 로그인 화면
// - 지금(mock): 역할별 개발용 버튼 3개
// - Firebase 연결 후: "Google 계정으로 로그인" 버튼 1개
// 비밀번호 입력창은 만들지 않습니다.
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, type Role } from '../services';
import Card from '../components/Card';
import RoleBadge from '../components/RoleBadge';
import { ErrorMessage } from '../components/Status';

// 로그인 후 돌아갈 주소. 사이트 안의 주소("/"로 시작, "//"는 제외)만 허용
function safeNext(next: string | null): string {
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) return next;
  return '/';
}

// 카카오톡·인스타그램 등 앱 안에서 열린 브라우저인가
// (Google은 이런 브라우저에서 로그인을 막음: "403 disallowed_useragent")
function isInAppBrowser(): boolean {
  return /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(inapp|DaumApps|everytimeApp|; wv\)/i.test(navigator.userAgent);
}

const devOptions: { role: Exclude<Role, 'guest'>; label: string; hint: string }[] = [
  { role: 'admin', label: '교수로 로그인', hint: '모든 글·댓글 삭제 가능' },
  { role: 'member', label: '승인 회원으로 로그인', hint: '토론 읽기·쓰기, 본인 글 삭제' },
  { role: 'pending', label: '미승인 회원으로 로그인', hint: '토론 열람 불가(승인 대기)' },
];

export default function Login() {
  const { user, role } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const next = safeNext(params.get('next'));

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-title">로그인</h1>

      {user && (
        <p className="mt-4 flex flex-wrap items-center gap-2 text-gray-700">
          현재 <strong>{user.displayName}</strong>님으로 로그인되어 있습니다. <RoleBadge role={role} />
        </p>
      )}

      <Card className="mt-6">
        {authService.devSignIn ? (
          <>
            <div className="flex items-center gap-2">
              <span className="rounded border border-dashed border-navy-600 px-2 py-0.5 text-sm font-bold text-navy-700">개발용</span>
              <p className="text-sm text-gray-700">가상 계정으로 권한별 화면을 확인합니다.</p>
            </div>
            <ul className="mt-5 space-y-3">
              {devOptions.map((o) => (
                <li key={o.role}>
                  <button
                    type="button"
                    className="btn-primary w-full text-left"
                    disabled={busy}
                    onClick={() => run(() => authService.devSignIn!(o.role))}
                  >
                    {o.label}
                    <span className="block text-sm font-normal text-navy-200">{o.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-gray-600">Firebase를 연결하면 이 버튼들은 Google 로그인 버튼으로 바뀝니다.</p>
          </>
        ) : (
          <>
            {isInAppBrowser() && (
              <div role="alert" className="mb-4 rounded-md border-l-4 border-navy-800 bg-navy-50 px-4 py-3 text-navy-900">
                카카오톡 등 앱 안의 브라우저에서는 Google 로그인이 막힙니다. 화면의 메뉴(⋮ 또는 공유 버튼)에서
                <strong> 다른 브라우저로 열기</strong>(Chrome·Safari)를 선택해 주세요.
              </div>
            )}
            <button type="button" className="btn-primary w-full" disabled={busy} onClick={() => run(() => authService.signIn())}>
              {busy ? '로그인 창을 확인해 주세요…' : 'Google 계정으로 로그인'}
            </button>
            <p className="mt-4 text-sm text-gray-600">
              버튼을 누르면 Google 로그인 창이 새로 열립니다. 창이 뜨지 않으면 브라우저의 팝업 차단을 풀어 주세요.
            </p>
          </>
        )}
        {error && (
          <div className="mt-4">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}
      </Card>

      <p className="mt-6 text-center">
        <Link to="/" className="text-link">
          홈으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
