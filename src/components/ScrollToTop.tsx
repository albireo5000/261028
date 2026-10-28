// 페이지를 옮기면 화면 맨 위로 이동하고 브라우저 탭 제목을 사이트 이름으로 맞춤
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { site } from '../config/site';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = site.name;
  }, [pathname]);
  return null;
}
