import React from 'react';
import { useNavigate } from 'react-router';
import './AdminWorkshopsPage.css';

// Using the same mock data for consistency
const MOCK_WORKSHOPS = [
  {
    id: 1,
    title: 'Kỹ năng thuyết trình ấn tượng',
    time: '08:00 - 11:00 05/05/2026',
    location: 'Hội trường A',
    speaker: 'ThS. Nguyễn Văn A',
    price: 0,
    slots: 60,
    slotsLeft: 12,
    summary: 'Buổi workshop này sẽ giúp bạn nắm vững các kỹ thuật thuyết trình hiện đại, từ cách xây dựng cấu trúc bài nói logic đến việc sử dụng ngôn ngữ hình thể để thu hút khán giả. Bạn sẽ được thực hành trực tiếp và nhận phản hồi từ chuyên gia.',
    status: 'Đang mở'
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
    summary: 'Khám phá hệ sinh thái React hiện đại, từ cơ bản đến nâng cao. Tìm hiểu cách tối ưu hiệu năng và quản lý state hiệu quả.',
    status: 'Đang mở'
  },
  {
    id: 3,
    title: 'Tư duy thiết kế (Design Thinking)',
    time: '09:00 - 12:00 07/05/2026',
    location: 'Phòng 402 - Nhà C',
    speaker: 'Designer Lê Văn C',
    price: 0,
    slots: 50,
    slotsLeft: 48,
    status: 'Đang mở'
  },
  {
    id: 4,
    title: 'Quản lý tài chính cá nhân cho sinh viên',
    time: '13:30 - 16:30 08/05/2026',
    location: 'Phòng 201 - Nhà B',
    speaker: 'Chuyên gia tài chính Phạm D',
    price: 0,
    slots: 100,
    slotsLeft: 0,
    status: 'Đã hết chỗ'
  }
];

const AdminWorkshopsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-workshops-container">
      <div className="admin-sidebar">
        <div className="admin-logo">UniHub Admin</div>
        <nav className="admin-nav">
          <button className="admin-nav-item active">
            <i className="fa-solid fa-calendar-check"></i>
            <span>Quản lý Workshop</span>
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={() => navigate('/login')}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="admin-main-content">
        <header className="admin-header">
          <div className="header-title">
            <h1>Danh sách Workshop</h1>
            <p>Quản lý và theo dõi các buổi workshop trong hệ thống</p>
          </div>
          <div className="header-actions">
            <button className="btn-add-workshop" onClick={() => navigate('/admin/workshops/create')}>
              <i className="fa-solid fa-plus"></i> Tạo Workshop Mới
            </button>
          </div>
        </header>

        <div className="admin-stats-cards">
          <div className="stat-card">
            <div className="stat-label">Tổng số Workshop</div>
            <div className="stat-value">24</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Đang diễn ra</div>
            <div className="stat-value">8</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tổng lượt đăng ký</div>
            <div className="stat-value">1,240</div>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Workshop</th>
                <th>Diễn giả</th>
                <th>Ngày & Giờ</th>
                <th>Địa điểm</th>
                <th>Sức chứa</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_WORKSHOPS.map((ws) => (
                <tr key={ws.id}>
                  <td>
                    <div className="workshop-cell">
                      <span className="workshop-name">{ws.title}</span>
                    </div>
                  </td>
                  <td>{ws.speaker}</td>
                  <td>
                    <div className="datetime-cell">
                      <span>{ws.time}</span>
                    </div>
                  </td>
                  <td>{ws.location}</td>
                  <td>
                    <div className="slots-cell">
                      <span>{ws.slots - ws.slotsLeft}/{ws.slots}</span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${((ws.slots - ws.slotsLeft) / ws.slots) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon-action" title="Sửa"><i className="fa-solid fa-pen"></i></button>
                      <button className="btn-icon-action" title="Xóa"><i className="fa-solid fa-trash"></i></button>
                      <button className="btn-icon-action" title="Xem chi tiết"><i className="fa-solid fa-eye"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkshopsPage;
