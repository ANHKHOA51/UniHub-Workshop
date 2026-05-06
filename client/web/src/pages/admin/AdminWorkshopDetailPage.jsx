import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useWorkshopDetail, useWorkshopRegistrations } from '../../hooks/useWorkShopData';
import './AdminWorkshopDetailPage.css';

const AdminWorkshopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workshop, loading: workshopLoading, error: workshopError } = useWorkshopDetail(id);
  const { registrations, loading: regsLoading, error: regsError } = useWorkshopRegistrations(id);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      reg.mssv?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'checked_in' && reg.check_in) ||
      (statusFilter === 'not_checked_in' && !reg.check_in);

    return matchesSearch && matchesStatus;
  });

  const checkedInCount = registrations.filter(r => r.check_in).length;

  if (workshopLoading) return <div className="loading-container">Đang tải thông tin workshop...</div>;
  if (workshopError) return <div className="error-container">Lỗi: {workshopError}</div>;
  if (!workshop) return <div className="error-container">Không tìm thấy workshop.</div>;

  return (
    <div className="admin-detail-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">UniHub Admin</div>
        <nav className="admin-nav">
          <button className="admin-nav-item active" onClick={() => navigate('/admin/workshops')}>
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

      <main className="admin-detail-main">
        <header className="detail-header">
          <div className="header-left">
            <div className="title-with-menu">
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
                <i className="fa-solid fa-bars"></i>
              </button>
              <button className="btn-back" onClick={() => navigate('/admin/workshops')}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách
              </button>
            </div>
            <h1>{workshop.title}</h1>
            <div className="header-meta">
              <span><i className="fa-solid fa-user-tie"></i> {workshop.speaker}</span>
              <span><i className="fa-solid fa-calendar-days"></i> {formatDate(workshop.time)}</span>
              <span><i className="fa-solid fa-location-dot"></i> {workshop.location}</span>
            </div>
          </div>
        </header>

        <div className="admin-detail-stats">
          <div className="stat-card">
            <span className="label">Tổng số đăng ký</span>
            <span className="value">{registrations.length}</span>
          </div>
          <div className="stat-card">
            <span className="label">Đã Check-in</span>
            <span className="value">{checkedInCount}</span>
          </div>
          <div className="stat-card">
            <span className="label">Tỷ lệ tham gia</span>
            <span className="value">
              {registrations.length > 0 
                ? Math.round((checkedInCount / registrations.length) * 100) 
                : 0}%
            </span>
          </div>
          <div className="stat-card">
            <span className="label">Sức chứa</span>
            <span className="value">{workshop.capacity}</span>
          </div>
        </div>

        <section className="participants-section">
          <div className="section-header">
            <h2>Danh sách người tham gia</h2>
            <div className="filters-wrapper">
              <div className="search-input-wrapper">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  placeholder="Tìm theo Tên, MSSV hoặc Email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="checked_in">Đã Check-in</option>
                <option value="not_checked_in">Chưa Check-in</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            {regsLoading ? (
              <div className="loading-container" style={{ padding: '40px' }}>Đang tải danh sách đăng ký...</div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="empty-state">
                <i className="fa-solid fa-users-slash"></i>
                <p>Không tìm thấy người tham gia nào phù hợp.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>MSSV</th>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Check-in</th>
                    <th>Thời gian đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 600 }}>{reg.mssv}</td>
                      <td style={{ fontWeight: 500 }}>{reg.name}</td>
                      <td>{reg.email}</td>
                      <td>
                        <span className={`status-badge ${reg.status === 'success' ? 'success' : 'pending'}`}>
                          {reg.status === 'success' ? 'Thành công' : 'Chờ xử lý'}
                        </span>
                      </td>
                      <td>
                        {reg.check_in ? (
                          <div className="checkin-badge yes">
                            <i className="fa-solid fa-circle-check"></i>
                            {new Date(reg.check_in).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <div className="checkin-badge no">
                            <i className="fa-solid fa-circle-xmark"></i>
                            Chưa
                          </div>
                        )}
                      </td>
                      <td>{formatDate(reg.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminWorkshopDetailPage;
