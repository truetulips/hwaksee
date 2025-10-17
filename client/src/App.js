import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from './api/axios';
import styles from './css/Default.module.css';

import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ErrorBoundary from './components/ErrorBoundary';
import MyPosts from './pages/MyPosts';
import AdminDashboard from './pages/AdminDashboard';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import About from './pages/About';
import Process from './pages/Process';
import Footer from './components/Footer';
import NotFound from './NotFound';

// ✅ Intro 컴포넌트는 Router 내부에서 선언되어야 함
function Intro() {
  const navigate = useNavigate();

  return (
    <main className={styles.main}>      
      <div className={styles.start}>
        <button className={styles.mainButton} onClick={() => navigate('/login')}><i className={styles.logIn}></i>로그인</button>
        <button className={styles.mainButton} onClick={() => navigate('/register')}><i className={styles.userAdd}></i>회원가입</button>
      </div>
      <About />
    </main>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => {
      localStorage.removeItem('token');
      setUser(null);
    });
  }, []);

  // ✅ 로그인 성공 시
  const handleLogin = userData => {
    setUser(userData);
    navigate('/');
  };

  // ✅ 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  // ✅ 계정 삭제
  const handleDeleteAccount = async () => {
    try {
      await axios.delete('/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('계정 삭제 실패:', err);
    }
  };

  return (
    <div className={styles.layoutwrapper}>
      <ErrorBoundary>
        <Header
          user={user}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
        <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={user ? <MyPosts user={user} /> : <Intro />} />
          <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/posts" element={<PostsPage user={user} />} />
          <Route path="/posts/:id" element={<PostDetailPage user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/process" element={<Process />} />
          <Route path="/admin" element={
            user?.role === 'admin' || user?.role === 'manager'
              ? <AdminDashboard user={user} />
              : <Navigate to="/" />
          } />
          <Route path="/admin/posts/:id" element={
            user?.role === 'admin' || user?.role === 'manager'
              ? <PostDetailPage user={user} />
              : <Navigate to="/" />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </main>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}