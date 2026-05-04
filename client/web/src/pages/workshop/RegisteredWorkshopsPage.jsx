import React from 'react';
import { useNavigate } from 'react-router';
import { MOCK_WORKSHOPS } from './WorkshopsPage';
import './RegisteredWorkshopsPage.css';

const REGISTERED_MOCK = [
  { ...MOCK_WORKSHOPS[0], status: 'confirmed', qrCode: 'WS-12345-QR' },
  { ...MOCK_WORKSHOPS[1], status: 'pending_payment', qrCode: null },
];

const RegisteredWorkshopsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="registered-workshops-container">
      <header className="registered-header">
        <button className="back-button-floating" onClick={() => navigate('/workshops')}>
          ← Quay lại
        </button>
        <div className="header-content">
          <h1>Workshop của tôi</h1>
          <p>Quản lý các workshop bạn đã đăng ký và theo dõi trạng thái</p>
        </div>
      </header>

      <main className="registered-list-container">
        {REGISTERED_MOCK.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa đăng ký workshop nào.</p>
            <button onClick={() => navigate('/workshops')}>Khám phá ngay</button>
          </div>
        ) : (
          <div className="registered-grid">
            {REGISTERED_MOCK.map((ws) => (
              <div key={ws.id} className="registered-card" onClick={() => navigate(`/workshops/${ws.id}`)}>
                <div className="card-header">
                  <div className="ws-thumb" style={{ backgroundImage: `url(${ws.image})` }}></div>
                  <div className="ws-main-info">
                    <h3>{ws.title}</h3>
                    <p className="ws-meta">📅 {ws.date} | {ws.time}</p>
                    <p className="ws-meta">📍 {ws.location}</p>
                  </div>
                  <div className={`status-badge-inline ${ws.status}`}>
                    {ws.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ thanh toán'}
                  </div>
                </div>
                
                <div className="card-footer-action">
                  {ws.status === 'confirmed' ? (
                    <div className="qr-preview-section">
                      <span className="qr-label">Mã vé: <strong>{ws.qrCode}</strong></span>
                      <button className="view-qr-btn">Xem mã QR</button>
                    </div>
                  ) : (
                    <div className="payment-action-section">
                      <span className="payment-warning">Vui lòng thanh toán để giữ chỗ</span>
                      <button className="pay-now-btn">Thanh toán ngay</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RegisteredWorkshopsPage;
