// 상단 바: 사이트 이름, 메뉴(홈/연구/수업 자료/토론), 로그인 상태
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { site } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import RoleBadge from './RoleBadge';

const menu = [
  { to: '/', label: '홈', end: true },
  { to: '/research', label: '연구', end: false },
  { to: '/teaching', label: '수업 자료', end: false },
  { to: '/discussion', label: '토론', end: false },
];

// 현재 페이지 메뉴는 흰 글씨 + 흰 밑줄로 표시
function navClass({ isActive }: { isActive: boolean }) {
  return [
    'block rounded px-3 py-2 text-base font-medium transition-colors',
    isActive ? 'text-white underline decoration-2 underline-offset-8' : 'text-navy-200 hover:text-white',
  ].join(' ');
}

export default function Header() {
  const { user, role, loading } = useAuth();
  const [open, setOpen] = useState(false); // 모바일 메뉴 열림 여부
  const location = useLocation();
  const navigate = useNavigate();

  // 다른 페이지로 이동하면 모바일 메뉴를 닫음
  useEffect(() => setOpen(false), [location.pathname]);

  async function handleSignOut() {
    await authService.signOut();
    navigate('/');
  }

  const loginArea = loading ? null : user ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-navy-200">
        <span className="font-medium text-white">{user.displayName}</span>님
      </span>
      <RoleBadge role={role} />
      <button type="button" onClick={handleSignOut} className="btn-outline-light">
        로그아웃
      </button>
    </div>
  ) : (
    <Link
      to={`/login?next=${encodeURIComponent(location.pathname)}`}
      className="btn-light"
    >
      로그인
    </Link>
  );

  return (
    <header className="on-dark bg-navy-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-white">
          {/* 사이트 표시용 작은 흰 사각형 (장식) */}
          <span aria-hidden="true" className="h-6 w-1.5 rounded-sm bg-white" />
          {site.name}
        </Link>

        {/* 모바일에서만 보이는 메뉴 열기 버튼 */}
        <button
          type="button"
          className="btn-outline-light md:hidden"
          aria-expanded={open}
          aria-controls="main-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '메뉴 닫기' : '메뉴 열기'}
        </button>

        {/* 데스크톱 메뉴 */}
        <nav aria-label="주 메뉴" className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-1">
            {menu.map((m) => (
              <li key={m.to}>
                <NavLink to={m.to} end={m.end} className={navClass}>
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {loginArea}
        </nav>
      </div>

      {/* 모바일 메뉴 (버튼을 눌렀을 때만 보임) */}
      {open && (
        <nav id="main-menu" aria-label="주 메뉴" className="border-t border-white/10 px-4 pb-4 md:hidden">
          <ul className="py-2">
            {menu.map((m) => (
              <li key={m.to}>
                <NavLink to={m.to} end={m.end} className={navClass}>
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {loginArea}
        </nav>
      )}
    </header>
  );
}
