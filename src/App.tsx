// 주소(URL)와 화면을 연결하는 곳
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Research from './pages/Research';
import ResearchDetail from './pages/ResearchDetail';
import Teaching from './pages/Teaching';
import Discussion from './pages/Discussion';
import DiscussionDetail from './pages/DiscussionDetail';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="research" element={<Research />} />
            <Route path="research/:id" element={<ResearchDetail />} />
            <Route path="teaching" element={<Teaching />} />
            <Route path="discussion" element={<Discussion />} />
            <Route path="discussion/:id" element={<DiscussionDetail />} />
            <Route path="login" element={<Login />} />
            {/* 위에 없는 모든 주소 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
