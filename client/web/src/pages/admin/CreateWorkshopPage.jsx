import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCreateWorkshop } from '../../hooks/useWorkShopData';
import './CreateWorkshopPage.css';

const CreateWorkshopPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateWorkshop();
  const [formKey, setFormKey] = useState(Date.now());
  
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    time: '',
    location: '',
    price: 0,
    capacity: '',
    description: ''
  });

  const [floorPlan, setFloorPlan] = useState(null);
  const [introPdf, setIntroPdf] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'floorPlan') {
      if (file && file.size > 10 * 1024 * 1024) {
        alert('Sơ đồ phòng không được vượt quá 10MB.');
        e.target.value = '';
        return;
      }
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (file && !allowedImageTypes.includes(file.type)) {
        alert('Sơ đồ phòng chỉ chấp nhận định dạng PNG hoặc JPG/JPEG.');
        e.target.value = '';
        return;
      }
      setFloorPlan(file);
    } else if (type === 'introPdf') {
      if (file && file.size > 10 * 1024 * 1024) {
        alert('Tài liệu PDF không được vượt quá 10MB.');
        e.target.value = '';
        return;
      }
      setIntroPdf(file);
    }
  };

  const validateForm = () => {
    if (!formData.title || !formData.speaker || !formData.time || !formData.location || !formData.capacity || !formData.description) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc.');
      return false;
    }

    if (new Date(formData.time) < new Date()) {
      alert('Thời gian tổ chức phải ở trong tương lai.');
      return false;
    }

    if (parseInt(formData.capacity) <= 0) {
      alert('Sức chứa phải lớn hơn 0.');
      return false;
    }

    if (!floorPlan) {
      alert('Vui lòng tải lên sơ đồ phòng.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createMutation.mutateAsync({
        ...formData,
        floor_plan: floorPlan,
        pdf: introPdf
      });
      
      alert('Workshop đã được tạo thành công!');
      navigate('/admin/workshops');
    } catch (err) {
      console.error('Failed to create workshop:', err);
      alert('Đã xảy ra lỗi khi tạo workshop. Vui lòng thử lại.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả các trường đã nhập?')) {
      setFormData({
        title: '',
        speaker: '',
        time: '',
        location: '',
        price: 0,
        capacity: '',
        description: ''
      });
      setFloorPlan(null);
      setIntroPdf(null);
      setFormKey(Date.now()); // Force re-render of file inputs
    }
  };

  return (
    <div className="create-workshop-container">
      <div className="admin-sidebar">
        <div className="admin-logo">UniHub Admin</div>
        <nav className="admin-nav">
          <button className="admin-nav-item" onClick={() => navigate('/admin/workshops')}>
            <i className="fa-solid fa-calendar-check"></i>
            <span>Quản lý Workshop</span>
          </button>
          <button className="admin-nav-item active">
            <i className="fa-solid fa-plus"></i>
            <span>Tạo Workshop</span>
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
            <h1>Tạo Workshop Mới</h1>
            <p>Nhập thông tin chi tiết để xuất bản workshop mới lên hệ thống</p>
          </div>
          <div className="header-actions">
          </div>
        </header>

        <form className="create-workshop-form" onSubmit={handleSubmit} key={formKey}>
          <div className="form-card">
            <div className="form-section">
              <h2>Thông tin cơ bản</h2>
              <div className="form-group">
                <label htmlFor="title">Tên Workshop <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="Ví dụ: Kỹ năng quản lý thời gian"
                />
              </div>

              <div className="form-group">
                <label htmlFor="speaker">Diễn giả <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="speaker" 
                  name="speaker" 
                  value={formData.speaker} 
                  onChange={handleChange} 
                  required 
                  placeholder="Tên diễn giả"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Thời gian & Địa điểm</h2>
              <div className="form-group">
                <label htmlFor="time">Thời gian tổ chức <span className="required">*</span></label>
                <input 
                  type="datetime-local" 
                  id="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Địa điểm <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  placeholder="Phòng học, hội trường..."
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Sức chứa & Học phí</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="capacity">Sức chứa (Capacity) <span className="required">*</span></label>
                  <input 
                    type="number" 
                    id="capacity" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleChange} 
                    required 
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Học phí (VNĐ) <span className="required">*</span></label>
                  <input 
                    type="number" 
                    id="price" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    required 
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Nội dung chi tiết</h2>
              <div className="form-group">
                <label htmlFor="description">Mô tả workshop <span className="required">*</span></label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows="6"
                  placeholder="Giới thiệu chi tiết về nội dung workshop..."
                ></textarea>
              </div>
            </div>

            <div className="form-section">
              <h2>Tài liệu đính kèm</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="floorPlan">Sơ đồ phòng (Ảnh) <span className="required">*</span></label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file" 
                      id="floorPlan" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => handleFileChange(e, 'floorPlan')}
                      required
                    />
                    <div className="file-preview">
                      <i className="fa-solid fa-map"></i>
                      <span>{floorPlan ? floorPlan.name : 'Chọn ảnh sơ đồ phòng (PNG, JPG)'}</span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="introPdf">Tài liệu giới thiệu (PDF)</label>
                  <div className="file-upload-wrapper">
                    <input 
                      type="file" 
                      id="introPdf" 
                      accept=".pdf" 
                      onChange={(e) => handleFileChange(e, 'introPdf')}
                    />
                    <div className="file-preview">
                      <i className="fa-solid fa-file-pdf"></i>
                      <span>{introPdf ? introPdf.name : 'Tải lên file PDF giới thiệu'}</span>
                    </div>
                  </div>
                  <small className="form-hint">Dùng để AI tự động tóm tắt nội dung</small>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-reset" onClick={handleReset}>Xóa tất cả</button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/admin/workshops')}>Hủy</button>
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>Đang xử lý...</>
                ) : (
                  <><i className="fa-solid fa-check"></i> Tạo Workshop</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkshopPage;
