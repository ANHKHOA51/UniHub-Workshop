import React from 'react';
import { useParams, useNavigate } from 'react-router'
import './WorkshopsPage.css';

export const MOCK_WORKSHOPS = [
  {
    id: 1,
    title: 'Kỹ năng thuyết trình ấn tượng',
    time: '08:00 - 11:00 05/05/2026',
    location: 'Hội trường A',
    speaker: 'ThS. Nguyễn Văn A',
    price: 0,
    slots: 60,
    slotsLeft: 12,
    summary: 'Buổi workshop này sẽ giúp bạn nắm vững các kỹ thuật thuyết trình hiện đại, từ cách xây dựng cấu trúc bài nói logic đến việc sử dụng ngôn ngữ hình thể để thu hút khán giả. Bạn sẽ được thực hành trực tiếp và nhận phản hồi từ chuyên gia.'
  },
  {
    id: 2,
    title: 'Lập trình Web hiện đại với React',
    time: '14:00 - 17:00 06/05/2026',
    location: 'Phòng Lab 2',
    speaker: 'Kỹ sư Trần Thị B',
    price: 50000,
    slots: 40,
    slotsLeft: 5,
    summary: 'Khám phá hệ sinh thái React hiện đại, từ cơ bản đến nâng cao. Tìm hiểu cách tối ưu hiệu năng và quản lý state hiệu quả.'
  },
  {
    id: 3,
    title: 'Tư duy thiết kế (Design Thinking)',
    time: '09:00 - 12:00 07/05/2026',
    location: 'Phòng 402 - Nhà C',
    speaker: 'Designer Lê Văn C',
    price: 0,
    slots: 50,
    slotsLeft: 48
  },
  {
    id: 4,
    title: 'Quản lý tài chính cá nhân cho sinh viên',
    time: '13:30 - 16:30 08/05/2026',
    location: 'Phòng 201 - Nhà B',
    speaker: 'Chuyên gia tài chính Phạm D',
    price: 0,
    slots: 100,
    slotsLeft: 0
  }
];

const WorkshopsPage = () => {
  const navigate = useNavigate();
  return (
    <div className="workshops-container">
      <header className="workshops-header">
        <div className="header-content">
          <h1>Danh sách Workshop</h1>
          <p>Khám phá và đăng ký các buổi workshop hấp dẫn trong tuần lễ kỹ năng</p>

          <div className="search-filter-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm workshop, diễn giả..."
            />
            <select className="filter-select">
              <option value="">Tất cả ngày</option>
              <option value="05/05">Thứ Hai - 05/05</option>
              <option value="06/05">Thứ Ba - 06/05</option>
            </select>
          </div>
        </div>
      </header>

      <main className="workshops-grid-container">
        <div className="workshops-grid">
          {MOCK_WORKSHOPS.map((ws) => (
            <div key={ws.id} className="workshop-card" onClick={() => navigate(`/workshops/${ws.id}`)}>
              <div className="card-content">
                <div className="card-top-info">
                  {ws.slotsLeft === 0 && <span className="status-badge sold-out">Hết chỗ</span>}
                  {ws.price === 0 ? (
                    <span className="price-badge free">Miễn phí</span>
                  ) : (
                    <span className="price-badge paid">{ws.price.toLocaleString('vi-VN')}đ</span>
                  )}
                </div>
                <h3 className="workshop-title">{ws.title}</h3>
                <div className="workshop-info">
                  <div className="info-item">
                    <span className="icon"><i className="fa-solid fa-calendar-days"></i></span>
                    <span>{ws.time}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                    <span>{ws.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon"><i className="fa-solid fa-user-tie"></i></span>
                    <span>{ws.speaker}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className={`slots-left ${ws.slotsLeft < 10 ? 'urgent' : ''}`}>
                    Còn {ws.slotsLeft}/{ws.slots} chỗ
                  </span>
                  <button className="view-detail-btn">Chi tiết</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WorkshopsPage;
