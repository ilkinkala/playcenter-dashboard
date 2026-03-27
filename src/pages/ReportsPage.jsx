import { useState, useEffect } from 'react';
import { getHistory } from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const [history, setHistory] = useState([]);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  function getFilteredRecords() {
    const now = new Date();
    return history.filter((record) => {
      const recordDate = new Date(record.completedAt);
      switch (period) {
        case 'daily':
          return recordDate.toDateString() === now.toDateString();
        case 'weekly': {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return recordDate >= weekAgo;
        }
        case 'monthly': {
          return (
            recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear()
          );
        }
        case 'yearly': {
          return recordDate.getFullYear() === now.getFullYear();
        }
        default:
          return true;
      }
    });
  }

  const filtered = getFilteredRecords();
  const totalRevenue = filtered.reduce((sum, r) => sum + r.finalPrice, 0);
  const totalChildren = filtered.length;
  const avgRevenue = totalChildren > 0 ? totalRevenue / totalChildren : 0;

  // Package breakdown
  const packageBreakdown = {};
  filtered.forEach((r) => {
    if (!packageBreakdown[r.packageLabel]) {
      packageBreakdown[r.packageLabel] = { count: 0, revenue: 0 };
    }
    packageBreakdown[r.packageLabel].count++;
    packageBreakdown[r.packageLabel].revenue += r.finalPrice;
  });

  const earlyPickups = filtered.filter((r) => r.usedMinutes < r.packageMinutes).length;

  const periodLabels = {
    daily: 'Gunluk',
    weekly: 'Haftalik',
    monthly: 'Aylik',
    yearly: 'Yillik',
  };

  // Find the max revenue for scaling bars
  const maxRevenue = Math.max(...Object.values(packageBreakdown).map((p) => p.revenue), 1);

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">
          <BarChart3 size={24} />
          Raporlar
        </h1>
        <div className="period-selector">
          {Object.entries(periodLabels).map(([key, label]) => (
            <button
              key={key}
              className={`period-btn ${period === key ? 'active' : ''}`}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Toplam Gelir</span>
            <span className="stat-value">{formatPrice(totalRevenue)}</span>
          </div>
        </div>
        <div className="stat-card children">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Toplam Cocuk</span>
            <span className="stat-value">{totalChildren}</span>
          </div>
        </div>
        <div className="stat-card average">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Ortalama Ucret</span>
            <span className="stat-value">{formatPrice(avgRevenue)}</span>
          </div>
        </div>
        <div className="stat-card early">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Erken Alis</span>
            <span className="stat-value">{earlyPickups}</span>
          </div>
        </div>
      </div>

      {Object.keys(packageBreakdown).length > 0 ? (
        <div className="breakdown-section">
          <h2 className="section-title">Paket Dagilimi</h2>
          <div className="breakdown-chart">
            {Object.entries(packageBreakdown).map(([label, data]) => (
              <div key={label} className="breakdown-bar-row">
                <div className="bar-label">
                  <span className="bar-package">{label}</span>
                  <span className="bar-count">{data.count} cocuk</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{formatPrice(data.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <BarChart3 size={48} strokeWidth={1} />
          <p>Bu donem icin veri bulunamadi</p>
        </div>
      )}
    </div>
  );
}
