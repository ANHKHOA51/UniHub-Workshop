import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router'
import LoginPage from './pages/login/LoginPage'
import WorkshopsPage from './pages/workshop/WorkshopsPage'
import WorkshopDetailPage from './pages/workshop/WorkshopDetailPage'
import RegisteredWorkshopsPage from './pages/workshop/RegisteredWorkshopsPage'
import AdminWorkshopsPage from './pages/admin/AdminWorkshopsPage'
import CreateWorkshopPage from './pages/admin/CreateWorkshopPage'
import AdminWorkshopDetailPage from './pages/admin/AdminWorkshopDetailPage'
import './App.css'

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className={`app ${isLoginPage ? 'login-page-active' : (isAdminPage ? 'admin-page-active' : 'content-page-active')}`}>
      {!isLoginPage && !isAdminPage && (
        <div className="top-nav-actions">
          <button
            className="nav-btn"
            onClick={() => navigate('/my-workshops')}
            style={{ marginRight: '10px' }}
          >
            Workshop đã đăng ký
          </button>
          <button className="temp-logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      )}

      <button
        className={`scroll-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Cuộn lên đầu trang"
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
        <Route path="/my-workshops" element={<RegisteredWorkshopsPage />} />
        <Route path="/admin/workshops" element={<AdminWorkshopsPage />} />
        <Route path="/admin/workshops/create" element={<CreateWorkshopPage />} />
        <Route path="/admin/workshops/:id" element={<AdminWorkshopDetailPage />} />
      </Routes>
    </div>
  )
}

export default App

