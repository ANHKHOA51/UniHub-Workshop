import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mock credentials check
    if (email === 'admin@unihub.com' && password === '123') {
      navigate('/admin/workshops');
    } else {
      // Default to regular workshops for any other login (simulating user login)
      navigate('/workshops');
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
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>
          
          <button type="submit" className="login-button">
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
