import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useWorkshops } from '../../hooks/useWorkShopData';
import './WorkshopsPage.css';

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

const WorkshopsPage = () => {
  const navigate = useNavigate();
  const { workshops, loading, error } = useWorkshops();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const uniqueDates = useMemo(() => {
    const dates = new Set();
    workshops.forEach((ws) => {
      if (ws.time) {
        const d = new Date(ws.time);
        if (!isNaN(d.getTime())) {
          const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          dates.add(label);
        }
      }
    });
    return Array.from(dates).sort();
  }, [workshops]);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((ws) => {
      const matchesSearch =
        !searchTerm ||
        ws.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ws.speaker.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !filterDate || (() => {
        if (!ws.time) return false;
        const d = new Date(ws.time);
        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        return label === filterDate;
      })();

      return matchesSearch && matchesDate;
    });
  }, [workshops, searchTerm, filterDate]);

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="">Tất cả ngày</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="workshops-grid-container">
        {loading && (
          <div className="loading-state">
            <p>Đang tải danh sách workshop...</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-state">
            <p>Không thể tải danh sách workshop: {error}</p>
          </div>
        )}

        {!loading && !error && filteredWorkshops.length === 0 && (
          <div className="empty-state-message">
            <p>Không tìm thấy workshop nào.</p>
          </div>
        )}

        {!loading && !error && filteredWorkshops.length > 0 && (
          <div className="workshops-grid">
            {filteredWorkshops.map((ws) => (
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
                      <span>{formatWorkshopTime(ws.time)}</span>
                    </div>
                    <div className="info-item">
                      <span className="icon"><i className="fa-solid fa-location-dot"></i></span>
                      <span>{ws.location || 'Chưa xác định'}</span>
                    </div>
                    <div className="info-item">
                      <span className="icon"><i className="fa-solid fa-user-tie"></i></span>
                      <span>{ws.speaker || 'Chưa xác định'}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className={`slots-left ${ws.slotsLeft < 10 ? 'urgent' : ''}`}>
                      Còn {ws.slotsLeft}/{ws.capacity} chỗ
                    </span>
                    <button className="view-detail-btn">Chi tiết</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkshopsPage;
