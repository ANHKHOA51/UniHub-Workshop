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
      <div className="detail-hero" style={{ backgroundImage: `url(${workshop.image})` }}>
        <div className="hero-overlay"></div>
        <button className="back-button" onClick={() => navigate('/workshops')}>
          ← Quay lại
        </button>
        <div className="hero-content">
          <div className="detail-badges">
            {workshop.price === 0 ? (
              <span className="badge free">Miễn phí</span>
            ) : (
              <span className="badge paid">{workshop.price.toLocaleString('vi-VN')}đ</span>
            )}
            <span className="badge category">Kỹ năng mềm</span>
          </div>
          <h1>{workshop.title}</h1>
          <div className="hero-meta">
            <span>📅 {workshop.date} | {workshop.time}</span>
            <span>📍 {workshop.location}</span>
          </div>
        </div>
      </div>

      <div className="detail-content-layout">
        <main className="detail-main">
          <section className="detail-section">
            <h2>Giới thiệu Workshop</h2>
            <div className="ai-summary-box">
              <div className="ai-label">
                <span className="ai-icon">✨</span>
                AI Summary
              </div>
              <p>
                Buổi workshop này sẽ giúp bạn nắm vững các kỹ thuật thuyết trình hiện đại,
                từ cách xây dựng cấu trúc bài nói logic đến việc sử dụng ngôn ngữ hình thể
                để thu hút khán giả. Bạn sẽ được thực hành trực tiếp và nhận phản hồi từ chuyên gia.
              </p>
            </div>
            <p className="full-description">
              Trong môi trường học tập và làm việc hiện nay, khả năng truyền đạt ý tưởng một cách thuyết phục
              là yếu tố then chốt dẫn đến thành công. Workshop "Kỹ năng thuyết trình ấn tượng" được thiết kế
              nhằm trang bị cho sinh viên những công cụ và phương pháp thực tế nhất để vượt qua nỗi sợ hãi
              khi đứng trước đám đông và biến mỗi bài thuyết trình thành một trải nghiệm đáng nhớ.
            </p>
          </section>

          <section className="detail-section">
            <h2>Diễn giả</h2>
            <div className="speaker-card">
              <div className="speaker-avatar">
                <img src={`https://i.pravatar.cc/150?u=${workshop.speaker}`} alt={workshop.speaker} />
              </div>
              <div className="speaker-info">
                <h3>{workshop.speaker}</h3>
                <p className="speaker-title">Chuyên gia đào tạo kỹ năng Soft-Skills</p>
                <p className="speaker-bio">
                  Hơn 10 năm kinh nghiệm trong lĩnh vực đào tạo và phát triển con người.
                  Đã từng cố vấn cho nhiều dự án khởi nghiệp và cuộc thi thuyết trình cấp quốc gia.
                </p>
              </div>
            </div>
          </section>

          <section className="detail-section">
            <h2>Nội dung chương trình</h2>
            <ul className="agenda-list">
              <li>
                <span className="time">08:00</span>
                <span className="activity">Check-in và ổn định chỗ ngồi</span>
              </li>
              <li>
                <span className="time">08:30</span>
                <span className="activity">Phần 1: Phá băng và vượt qua nỗi sợ nói trước công chúng</span>
              </li>
              <li>
                <span className="time">10:00</span>
                <span className="activity">Nghỉ giải lao (Teabreak)</span>
              </li>
              <li>
                <span className="time">10:15</span>
                <span className="activity">Phần 2: Công thức xây dựng nội dung bài nói 4S</span>
              </li>
              <li>
                <span className="time">11:00</span>
                <span className="activity">Thực hành nhóm và Q&A</span>
              </li>
            </ul>
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
