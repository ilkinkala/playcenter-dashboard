import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import { printInvoice } from '../utils/printInvoice';
import { History, Baby, Users, Clock, CreditCard, Trash2, FileText, Search, Printer } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  async function handleClear() {
    await clearHistory();
    setHistory([]);
    setShowClearConfirm(false);
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getFilteredHistory() {
    let filtered = history;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.childName.toLowerCase().includes(q) ||
          r.parentName.toLowerCase().includes(q)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((r) => {
        const d = new Date(r.completedAt);
        switch (dateFilter) {
          case 'today':
            return d.toDateString() === now.toDateString();
          case 'week': {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return d >= weekAgo;
          }
          case 'month':
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  const filtered = getFilteredHistory();

  return (
    <div className="history-page">
      <div className="page-header">
        <h1 className="page-title">
          <History size={24} />
          Gecmis Kayitlar
          {history.length > 0 && (
            <span className="count-badge">{history.length}</span>
          )}
        </h1>
        {history.length > 0 && (
          <div className="header-actions">
            {showClearConfirm ? (
              <div className="clear-confirm">
                <span>Tum gecmis silinsin mi?</span>
                <button className="confirm-yes" onClick={handleClear}>Evet</button>
                <button className="confirm-no" onClick={() => setShowClearConfirm(false)}>Hayir</button>
              </div>
            ) : (
              <button className="clear-btn" onClick={() => setShowClearConfirm(true)}>
                <Trash2 size={16} />
                Gecmisi Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-filters">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Cocuk veya veli adi ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="date-filter">
            {[
              ['all', 'Tumu'],
              ['today', 'Bugun'],
              ['week', 'Bu Hafta'],
              ['month', 'Bu Ay'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`period-btn ${dateFilter === key ? 'active' : ''}`}
                onClick={() => setDateFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} strokeWidth={1} />
          <p>Henuz gecmis kayit yok</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Search size={48} strokeWidth={1} />
          <p>Aramanizla eslesen kayit bulunamadi</p>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((record) => {
            const isEarly = record.type === 'early';
            const isOvertime = record.type === 'overtime' && record.overtimeMinutes > 0;
            return (
              <div key={record.id} className={`history-card ${isEarly ? 'early' : ''} ${isOvertime ? 'overtime-card' : ''}`}>
                <div className="history-card-top">
                  <div className="history-date">{formatDate(record.completedAt)}</div>
                  <div className="history-badges">
                    {isEarly && <span className="early-badge">Erken Alis</span>}
                    {isOvertime && <span className="overtime-badge">Ekstra Sureli</span>}
                  </div>
                </div>
                <div className="history-card-body">
                  <div className="history-info">
                    <div className="history-row">
                      <Baby size={16} />
                      <span className="history-label">Cocuk:</span>
                      <strong>{record.childName}</strong>
                    </div>
                    <div className="history-row">
                      <Users size={16} />
                      <span className="history-label">Veli:</span>
                      <strong>{record.parentName}</strong>
                    </div>
                    <div className="history-row">
                      <Clock size={16} />
                      <span className="history-label">Paket:</span>
                      <span>{record.packageLabel}</span>
                      <span className="history-separator">|</span>
                      <span>Kullanilan: {Math.ceil(record.usedMinutes)} dk</span>
                    </div>
                    {isOvertime && (
                      <div className="history-row overtime-info">
                        <span className="history-label">Ekstra:</span>
                        <span>{Math.ceil(record.overtimeMinutes)} dk</span>
                        <span className="history-separator">|</span>
                        <span>+{formatPrice(record.overtimePrice)}</span>
                      </div>
                    )}
                  </div>
                  <div className="history-right">
                    <div className="history-price">
                      <CreditCard size={18} />
                      <span className="history-price-value">{formatPrice(record.finalPrice)}</span>
                    </div>
                    <button
                      className="history-print-btn"
                      onClick={() => printInvoice(record)}
                      title="Yazdir / PDF"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
