import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { QRCodeSVG } from 'qrcode.react';
import { useRegisteredWorkshops } from '../../hooks/useWorkShopData';
import './RegisteredWorkshopsPage.css';

const formatWorkshopTime = (isoString) => {
  if (!isoString) return 'Chưa xác định';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const pad = (n) => String(n).padStart(2, '0');
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const dd = pad(date.getDate());
  const mo = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  return `${hh}:${mm} ${dd}/${mo}/${yyyy}`;
};

const RegisteredWorkshopsPage = () => {
  const navigate = useNavigate();
  const { workshops, loading, error } = useRegisteredWorkshops();
  const [selectedQR, setSelectedQR] = useState(null);

  return (
    <div className="registered-workshops-container">
      <header className="registered-header">
        <button className="back-button-floating" onClick={() => navigate('/workshops')}>
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <div className="header-content">
          <h1>Workshop của tôi</h1>
          <p>Quản lý các workshop bạn đã đăng ký và theo dõi trạng thái</p>
        </div>
      </header>

      <main className="registered-list-container">
        {loading && (
          <div className="empty-state">
            <p>Đang tải danh sách workshop của bạn...</p>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <p>Không thể tải dữ liệu</p>
          </div>
        )}

        {!loading && !error && workshops.length === 0 && (
          <div className="empty-state">
            <p>Bạn chưa đăng ký workshop nào.</p>
            <button onClick={() => navigate('/workshops')}>Khám phá ngay</button>
          </div>
        )}

        {!loading && !error && workshops.length > 0 && (
          <div className="registered-grid">
            {workshops.map((ws) => (
              <div key={ws.id} className="registered-card" onClick={() => navigate(`/workshops/${ws.id}`)}>
                <div className="card-header">
                  <div className="ws-main-info">
                    <h3>{ws.title}</h3>
                    <p className="ws-meta"><i className="fa-solid fa-calendar-days"></i> {formatWorkshopTime(ws.time)}</p>
                    <p className="ws-meta"><i className="fa-solid fa-location-dot"></i> {ws.location || 'Chưa xác định'}</p>
                  </div>
                  <div className={`status-badge-inline ${ws.status}`}>
                    {ws.status === 'success' ? 'Đã đăng ký' : 'Đã tham gia'}
                  </div>
                </div>

                <div className="card-footer-action">
                  <div className="qr-preview-section">
                    <button
                      className="view-qr-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ws.qr_code) setSelectedQR(ws.qr_code);
                      }}
                    >
                      Xem mã QR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedQR && (
        <div className="qr-overlay" onClick={() => setSelectedQR(null)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Mã QR của bạn</h3>
            <div className="qr-container">
              <QRCodeSVG value={selectedQR} size={256} marginSize={5} />
            </div>
            <div className="qr-footer">
              <p className="qr-note">Vui lòng xuất trình mã này tại quầy check-in</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredWorkshopsPage;
