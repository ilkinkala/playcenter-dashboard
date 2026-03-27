import { formatPrice } from '../utils/pricing';
import { printInvoice } from '../utils/printInvoice';
import { Check, X, Baby, Users, Clock, CreditCard, AlertTriangle, TimerOff, Printer, Share2 } from 'lucide-react';

export default function CompletionModal({ record, onClose }) {
  if (!record) return null;

  const isEarly = record.type === 'early';
  const isOvertime = record.type === 'overtime' && record.overtimeMinutes > 0;

  function getTitle() {
    if (isEarly) return 'Erken Alış';
    if (isOvertime) return 'Ekstra Süreli Tamamlama';
    return 'Süre Tamamlandı';
  }

  function formatMinutes(min) {
    if (min < 1) return `${Math.round(min * 60)} saniye`;
    const h = Math.floor(min / 60);
    const m = Math.ceil(min % 60);
    if (h > 0) return `${h} saat ${m} dakika`;
    return `${m} dakika`;
  }

  function handlePrint() {
    printInvoice(record);
  }

  async function handleShare() {
    const text = [
      `Küçük Tilki - Fatura`,
      `Çocuk: ${record.childName}`,
      `Veli: ${record.parentName}`,
      `Paket: ${record.packageLabel}`,
      `Kullanılan Süre: ${formatMinutes(record.usedMinutes)}`,
      isOvertime ? `Ekstra Süre: +${formatMinutes(record.overtimeMinutes)}` : '',
      isOvertime ? `Ekstra Ücret: +${formatPrice(record.overtimePrice)}` : '',
      `Toplam: ${formatPrice(record.finalPrice)}`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Küçük Tilki Fatura', text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Fatura panoya kopyalandı!');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className={`modal-check ${isOvertime ? 'overtime' : ''}`}>
            {isOvertime ? <AlertTriangle size={32} /> : <Check size={32} />}
          </div>
          <h2>{getTitle()}</h2>
        </div>

        <div className="receipt">
          <div className="receipt-row">
            <span className="receipt-label">
              <Baby size={16} /> Çocuk
            </span>
            <span className="receipt-value">{record.childName}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">
              <Users size={16} /> Veli
            </span>
            <span className="receipt-value">{record.parentName}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">
              <Clock size={16} /> Paket
            </span>
            <span className="receipt-value">{record.packageLabel}</span>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-row">
            <span className="receipt-label">Paket Ücreti</span>
            <span className="receipt-value">{formatPrice(record.packagePrice)}</span>
          </div>

          {isEarly && (
            <>
              <div className="receipt-row muted">
                <span className="receipt-label">
                  <Clock size={14} /> Kullanılan Süre
                </span>
                <span className="receipt-value">
                  {formatMinutes(record.usedMinutes)}
                </span>
              </div>
              <div className="receipt-divider" />
              <div className="receipt-row total">
                <span className="receipt-label">
                  <CreditCard size={18} /> Ödenecek Tutar
                </span>
                <span className="receipt-value">{formatPrice(record.finalPrice)}</span>
              </div>
            </>
          )}

          {isOvertime && (
            <>
              <div className="receipt-row overtime-row">
                <span className="receipt-label">
                  <TimerOff size={14} /> Ekstra Süre
                </span>
                <span className="receipt-value overtime-text">
                  +{formatMinutes(record.overtimeMinutes)}
                </span>
              </div>
              <div className="receipt-row overtime-row">
                <span className="receipt-label">
                  <AlertTriangle size={14} /> Ekstra Ücret
                </span>
                <span className="receipt-value overtime-text">
                  +{formatPrice(record.overtimePrice)}
                </span>
              </div>
              <div className="receipt-divider" />
              <div className="receipt-row total">
                <span className="receipt-label">
                  <CreditCard size={18} /> Toplam Tutar
                </span>
                <span className="receipt-value">{formatPrice(record.finalPrice)}</span>
              </div>
              <div className="overtime-note">
                Ekstra ücret opsiyoneldir. İşletme sahibi sadece paket ücretini ({formatPrice(record.packagePrice)}) talep edebilir.
              </div>
            </>
          )}

          {!isEarly && !isOvertime && (
            <>
              <div className="receipt-divider" />
              <div className="receipt-row total">
                <span className="receipt-label">
                  <CreditCard size={18} /> Ödenecek Tutar
                </span>
                <span className="receipt-value">{formatPrice(record.finalPrice)}</span>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn" onClick={onClose}>
            Tamam
          </button>
          <button className="modal-btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            Yazdır / PDF
          </button>
          <button className="modal-btn-secondary" onClick={handleShare}>
            <Share2 size={16} />
            Paylaş
          </button>
        </div>
      </div>
    </div>
  );
}
