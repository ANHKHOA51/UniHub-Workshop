import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import * as authApi from '../../services/authApi';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await authApi.login(email, password);

      localStorage.setItem('token', data.tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin/workshops');
      } else {
        navigate('/workshops');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Không thể kết nối tới server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url('https://picsum.photos/1920/1080?university')` }}>
      <div className="login-overlay"></div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-text">UniHub</div>
          <p>Đăng nhập vào hệ thống Workshop</p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Địa chỉ Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="ten@sinhvien.daihoc.edu.vn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {errorMsg && (
            <div className="form-error" style={{ color: '#ff6b6b', fontSize: '0.875rem', marginBottom: '12px' }}>
              {errorMsg}
            </div>
          )}
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
