import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useWorkshopDetail, useRegisteredWorkshops, useRegisterWorkshop, useRegisterPaidWorkshop } from '../../hooks/useWorkShopData';
import { SERVER_BASE_URL } from '../../utils/constants';
import './WorkshopDetailPage.css';

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

const WorkshopDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workshop, loading, error } = useWorkshopDetail(id);
  const { workshops: registeredList } = useRegisteredWorkshops();
  const { mutate: registerFree, isPending: isRegisteringFree } = useRegisterWorkshop();
  const { mutateAsync: registerPaid, isPending: isRegisteringPaid } = useRegisterPaidWorkshop();

  const isRegistered = registeredList.some(w => String(w.id) === String(id));
  const isRegistering = isRegisteringFree || isRegisteringPaid;

  const handleRegister = async () => {
    if (!workshop) return;

    if (workshop.price === 0) {
      registerFree(workshop.id, {
        onSuccess: () => {
          alert('Đăng ký thành công!');
        },
        onError: (err) => {
          alert(`Đăng ký thất bại`);
        }
      });
    } else {
      try {
        const idempotencyKey = crypto.randomUUID();
        const response = await registerPaid({ workshopId: workshop.id, idempotencyKey });
        if (response.data && response.data.payUrl) {
          window.location.href = response.data.payUrl;
        } else {
          alert('Không lấy được link thanh toán. Vui lòng thử lại.');
        }
      } catch (err) {
        alert(`Đăng ký thất bại`);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        Đang tải thông tin workshop...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        Không thể tải workshop: {error}
      </div>
    );
  }

  if (!workshop) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        Workshop không tồn tại.
      </div>
    );
  }

  const registeredCount = workshop.registered_count ?? 0;
  const capacity = workshop.capacity ?? 0;
  const slotsLeft = workshop.slotsLeft ?? 0;
  const fillPercent = capacity > 0 ? Math.min(100, (registeredCount / capacity) * 100) : 0;

  return (
    <div className="workshop-detail-container">
      <div className="detail-header-section">
        <button className="back-button" onClick={() => navigate('/workshops')}>
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
        <div className="detail-header-content">
          <h1>{workshop.title}</h1>
          <div className="header-meta">
            <span><i className="fa-solid fa-user-tie"></i> {workshop.speaker || 'Chưa xác định'}</span>
            <span><i className="fa-solid fa-calendar-days"></i> {formatWorkshopTime(workshop.time)}</span>
            <span><i className="fa-solid fa-location-dot"></i> {workshop.location || 'Chưa xác định'}</span>
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
            <p className="full-description">{workshop.description}</p>
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
                  style={{ width: `${fillPercent}%` }}
                ></div>
              </div>
              <p>Đã đăng ký {registeredCount}/{capacity} chỗ</p>
            </div>
            <button
              className={`register-button ${isRegistered ? 'registered' : ''}`}
              disabled={slotsLeft === 0 || isRegistered || isRegistering}
              onClick={handleRegister}
            >
              {isRegistering ? 'Đang xử lý...' : isRegistered ? 'Đã đăng ký' : slotsLeft === 0 ? 'Hết chỗ' : 'Đăng ký ngay'}
            </button>
            <p className="reg-note">* Mã QR sẽ được gửi sau khi đăng ký thành công</p>
          </div>

          <div className="location-card">
            <h3>Địa điểm tổ chức</h3>
            <p><strong>{workshop.location || 'Chưa xác định'}</strong></p>
            <div className="map-placeholder">
              {workshop.floor_plan ? (
                <img
                  src={`${SERVER_BASE_URL}${workshop.floor_plan}`}
                  alt="Sơ đồ tầng"
                  className="floor-plan-image"
                />
              ) : (
                <span>Sơ đồ phòng đang tải...</span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
