import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useWorkshops, useUpdateWorkshop, useDeleteWorkshop } from '../../hooks/useWorkShopData';
import './AdminWorkshopsPage.css';

const AdminWorkshopsPage = () => {
  const navigate = useNavigate();
  const { workshops, loading, error } = useWorkshops();
  const updateMutation = useUpdateWorkshop();
  const deleteMutation = useDeleteWorkshop();

  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [deletingWorkshop, setDeletingWorkshop] = useState(null);
  const [editFormData, setEditFormData] = useState({ location: '', time: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const totalWorkshops = workshops.length;
  const totalRegistered = workshops.reduce((sum, ws) => sum + (ws.registered_count || 0), 0);
  const totalCheckedIn = workshops.reduce((sum, ws) => sum + (ws.checked_in_count || 0), 0);

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

  const toDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEditClick = (ws) => {
    setEditingWorkshop(ws);
    setEditFormData({
      location: ws.location || '',
      time: toDateTimeLocal(ws.time)
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: editingWorkshop.id,
        data: editFormData
      });
      setEditingWorkshop(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(deletingWorkshop.id);
      setDeletingWorkshop(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="admin-workshops-container">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
            <div className="title-with-menu">
              <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
                <i className="fa-solid fa-bars"></i>
              </button>
              <h1>Danh sách Workshop</h1>
            </div>
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
            <div className="stat-value">{totalWorkshops}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tổng lượt đăng ký</div>
            <div className="stat-value">{totalRegistered.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tổng lượt Check-in</div>
            <div className="stat-value">{totalCheckedIn.toLocaleString()}</div>
          </div>
        </div>

        <div className="admin-table-container">
          {loading ? (
            <div className="loading-container">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="error-container">Không thể tải danh sách workshop</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Workshop</th>
                  <th>Diễn giả</th>
                  <th>Ngày & Giờ</th>
                  <th>Địa điểm</th>
                  <th>Người tham gia</th>
                  <th>Check-in</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {workshops.map((ws) => (
                  <tr key={ws.id}>
                    <td>
                      <div className="workshop-cell">
                        <span className="workshop-name">{ws.title}</span>
                      </div>
                    </td>
                    <td>{ws.speaker}</td>
                    <td>
                      <div className="datetime-cell">
                        <span>{formatDate(ws.time)}</span>
                      </div>
                    </td>
                    <td>{ws.location}</td>
                    <td>
                      <div className="slots-cell">
                        <span>{ws.registered_count}/{ws.capacity}</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.min(100, (ws.registered_count / ws.capacity) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="slots-cell">
                        <span>{ws.checked_in_count}/{ws.registered_count}</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill checkin-fill"
                            style={{ width: `${ws.registered_count > 0 ? Math.min(100, (ws.checked_in_count / ws.registered_count) * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon-action" 
                          title="Sửa"
                          onClick={() => handleEditClick(ws)}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button 
                          className="btn-icon-action btn-delete" 
                          title="Xóa"
                          onClick={() => setDeletingWorkshop(ws)}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                        <button 
                          className="btn-icon-action" 
                          title="Xem chi tiết"
                          onClick={() => navigate(`/admin/workshops/${ws.id}`)}
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingWorkshop && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Cập nhật Workshop</h2>
              <button className="btn-close-modal" onClick={() => setEditingWorkshop(null)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <p className="edit-workshop-title">{editingWorkshop.title}</p>
                <div className="form-group">
                  <label>Địa điểm</label>
                  <input 
                    type="text" 
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian</label>
                  <input 
                    type="datetime-local" 
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingWorkshop(null)}>Hủy</button>
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWorkshop && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button className="btn-close-modal" onClick={() => setDeletingWorkshop(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa workshop <strong>{deletingWorkshop.title}</strong>?</p>
              <p className="delete-warning">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeletingWorkshop(null)}>Hủy</button>
              <button 
                className="btn-danger" 
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkshopsPage;
