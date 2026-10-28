// 모든 페이지 공통 틀: 상단 바 + 본문 + 바닥글
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 키보드 사용자가 메뉴를 건너뛰고 본문으로 바로 갈 수 있는 링크 */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-white"
      >
        본문 바로가기
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
