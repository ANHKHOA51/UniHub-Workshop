import React from 'react';
import { useParams, useNavigate } from 'react-router'
import { MOCK_WORKSHOPS } from './WorkshopsPage';
import './WorkshopDetailPage.css';

const WorkshopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const workshop = MOCK_WORKSHOPS.find(ws => ws.id === parseInt(id));

  if (!workshop) return <div style={{ padding: '100px', textAlign: 'center' }}>Workshop không tồn tại.</div>;

  return (
    <div className="workshop-detail-container">
      <div className="detail-header-section">
        <button className="back-button" onClick={() => navigate('/workshops')}>
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <div className="detail-header-content">
          <div className="detail-badges">
            {workshop.price === 0 ? (
              <span className="badge free">Miễn phí</span>
            ) : (
              <span className="badge paid">{workshop.price.toLocaleString('vi-VN')}đ</span>
            )}
          </div>
          <h1>{workshop.title}</h1>
          <div className="header-meta">
            <span><i className="fa-solid fa-user-tie"></i> {workshop.speaker}</span>
            <span><i className="fa-solid fa-calendar-days"></i> {workshop.time}</span>
            <span><i className="fa-solid fa-location-dot"></i> {workshop.location}</span>
          </div>
        </div>
      </div>

      <div className="detail-content-layout">
        <main className="detail-main">
          <section className="detail-section">
            <h2>Mô tả workshop</h2>
            {workshop.summary && (
              <div className="ai-summary-box">
                <div className="ai-label">
                  <span className="ai-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></span>
                  AI Summary
                </div>
                <p>{workshop.summary}</p>
              </div>
            )}
            <p className="full-description">
              Trong môi trường học tập và làm việc hiện nay, khả năng truyền đạt ý tưởng một cách thuyết phục
              là yếu tố then chốt dẫn đến thành công. Workshop "{workshop.title}" được thiết kế
              nhằm trang bị cho sinh viên những công cụ và phương pháp thực tế nhất để vượt qua nỗi sợ hãi
              khi đứng trước đám đông và biến mỗi bài thuyết trình thành một trải nghiệm đáng nhớ.
            </p>
          </section>
        </main>

        <aside className="detail-sidebar">
          <div className="registration-card">
            <div className="reg-price">
              <span className="label">Học phí</span>
              <span className="amount">
                {workshop.price === 0 ? 'Miễn phí' : `${workshop.price.toLocaleString('vi-VN')}đ`}
              </span>
            </div>
            <div className="reg-status">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${((workshop.slots - workshop.slotsLeft) / workshop.slots) * 100}%` }}
                ></div>
              </div>
              <p>Đã đăng ký {workshop.slots - workshop.slotsLeft}/{workshop.slots} chỗ</p>
            </div>
            <button className="register-button" disabled={workshop.slotsLeft === 0}>
              {workshop.slotsLeft === 0 ? 'Hết chỗ' : 'Đăng ký ngay'}
            </button>
            <p className="reg-note">* Mã QR sẽ được gửi sau khi đăng ký thành công</p>
          </div>

          <div className="location-card">
            <h3>Địa điểm tổ chức</h3>
            <p><strong>{workshop.location}</strong></p>
            <p>Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM</p>
            <div className="map-placeholder">
              <span>Sơ đồ phòng đang tải...</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
