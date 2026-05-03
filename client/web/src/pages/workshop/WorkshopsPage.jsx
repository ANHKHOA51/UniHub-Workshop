import React from 'react';
import { useParams, useNavigate } from 'react-router'
import './WorkshopsPage.css';

export const MOCK_WORKSHOPS = [
  {
    id: 1,
    title: 'Kỹ năng thuyết trình ấn tượng',
    date: '05/05/2026',
    time: '08:00 - 11:00',
    location: 'Hội trường A',
    speaker: 'ThS. Nguyễn Văn A',
    price: 0,
    slots: 60,
    slotsLeft: 12,
    image: 'https://picsum.photos/seed/ws1/400/250'
  },
  {
    id: 2,
    title: 'Lập trình Web hiện đại với React',
    date: '06/05/2026',
    time: '14:00 - 17:00',
    location: 'Phòng Lab 2',
    speaker: 'Kỹ sư Trần Thị B',
    price: 50000,
    slots: 40,
    slotsLeft: 5,
    image: 'https://picsum.photos/seed/ws2/400/250'
  },
  {
    id: 3,
    title: 'Tư duy thiết kế (Design Thinking)',
    date: '07/05/2026',
    time: '09:00 - 12:00',
    location: 'Phòng 402 - Nhà C',
    speaker: 'Designer Lê Văn C',
    price: 0,
    slots: 50,
    slotsLeft: 48,
    image: 'https://picsum.photos/seed/ws3/400/250'
  },
  {
    id: 4,
    title: 'Quản lý tài chính cá nhân cho sinh viên',
    date: '08/05/2026',
    time: '13:30 - 16:30',
    location: 'Phòng 201 - Nhà B',
    speaker: 'Chuyên gia tài chính Phạm D',
    price: 0,
    slots: 100,
    slotsLeft: 0,
    image: 'https://picsum.photos/seed/ws4/400/250'
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
              <div className="card-image" style={{ backgroundImage: `url(${ws.image})` }}>
                {ws.slotsLeft === 0 && <div className="status-badge sold-out">Hết chỗ</div>}
                {ws.price === 0 ? (
                  <div className="price-badge free">Miễn phí</div>
                ) : (
                  <div className="price-badge paid">{ws.price.toLocaleString('vi-VN')}đ</div>
                )}
              </div>
              <div className="card-content">
                <h3 className="workshop-title">{ws.title}</h3>
                <div className="workshop-info">
                  <div className="info-item">
                    <span className="icon">📅</span>
                    <span>{ws.date} | {ws.time}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon">📍</span>
                    <span>{ws.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="icon">👤</span>
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
