import { useState, useEffect } from 'react';
import { Clock, LogOut, AlertTriangle, TimerOff, Phone, Pencil, Check, Infinity } from 'lucide-react';
import { calculateProratedPrice, calculateUnlimitedPrice, formatPrice, getTolerance, getPackages } from '../utils/pricing';

export default function TimerCard({ child, onTimeUp, onComplete, onUpdatePhone }) {
  const [remaining, setRemaining] = useState(0);
  const [overtime, setOvertime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [showPickupConfirm, setShowPickupConfirm] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState(child.parentPhone || '');
  const [toleranceMinutes, setToleranceMinutes] = useState(5);
  const [packages, setPackages] = useState([]);

  const isUnlimited = child.packageMinutes === 0;

  useEffect(() => {
    getTolerance().then(setToleranceMinutes);
    getPackages().then(setPackages);
  }, []);

  useEffect(() => {
    function tick() {
      const now = Date.now();

      if (isUnlimited) {
        setElapsed(now - child.startTime);
      } else {
        const diff = child.endTime - now;
        if (diff <= 0) {
          setRemaining(0);
          setOvertime(Math.abs(diff));
          if (!isExpired) {
            setIsExpired(true);
            onTimeUp(child);
          }
        } else {
          setRemaining(diff);
        }
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [child.endTime, child.startTime, isExpired, isUnlimited]);

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function getElapsedMinutes() {
    const el = Date.now() - child.startTime;
    return el / (1000 * 60);
  }

  function getOvertimeMinutes() {
    return overtime / (1000 * 60);
  }

  function getProgress() {
    if (isUnlimited) return 0;
    const totalMs = child.packageMinutes * 60 * 1000;
    const el = Date.now() - child.startTime;
    return Math.min(100, (el / totalMs) * 100);
  }

  function getUrgencyClass() {
    if (isUnlimited) return 'unlimited';
    if (isExpired) return 'expired';
    const totalMs = child.packageMinutes * 60 * 1000;
    const ratio = remaining / totalMs;
    if (ratio <= 0.1) return 'critical';
    if (ratio <= 0.25) return 'warning';
    return 'normal';
  }

  function getCurrentUnlimitedPrice() {
    if (packages.length === 0) return 0;
    const elapsedMin = elapsed / (1000 * 60);
    const result = calculateUnlimitedPrice(elapsedMin, packages, toleranceMinutes);
    return result.finalPrice;
  }

  function handleEarlyPickup() {
    const elapsedMin = getElapsedMinutes();
    const proratedPrice = calculateProratedPrice(
      child.packageMinutes,
      child.packagePrice,
      elapsedMin
    );
    onComplete(child, {
      type: 'early',
      usedMinutes: elapsedMin,
      packagePrice: child.packagePrice,
      overtimeMinutes: 0,
      overtimePrice: 0,
      finalPrice: proratedPrice,
    });
  }

  function handleOvertimeComplete() {
    const overtimeMin = getOvertimeMinutes();

    // Tolerance period is free
    const billableOvertime = Math.max(0, overtimeMin - toleranceMinutes);
    const pricePerMinute = child.packagePrice / child.packageMinutes;
    const overtimePrice = Math.round(pricePerMinute * billableOvertime * 100) / 100;

    onComplete(child, {
      type: billableOvertime > 0 ? 'overtime' : 'normal',
      usedMinutes: child.packageMinutes + overtimeMin,
      packagePrice: child.packagePrice,
      overtimeMinutes: billableOvertime,
      overtimePrice,
      finalPrice: child.packagePrice + overtimePrice,
    });
  }

  function handleUnlimitedComplete() {
    const elapsedMin = getElapsedMinutes();
    const result = calculateUnlimitedPrice(elapsedMin, packages, toleranceMinutes);

    onComplete(child, {
      type: 'unlimited',
      usedMinutes: elapsedMin,
      packagePrice: result.matchedPackage.price,
      overtimeMinutes: result.overtimeMinutes,
      overtimePrice: result.overtimePrice,
      finalPrice: result.finalPrice,
    });
  }

  const urgency = getUrgencyClass();
  const progress = getProgress();
  const overtimeMin = getOvertimeMinutes();

  return (
    <div className={`timer-card ${urgency}`}>
      <div className="timer-card-header">
        <div className="child-info">
          <h3 className="child-name">{child.childName}</h3>
          <p className="parent-name">Veli: {child.parentName}</p>
          {!editingPhone ? (
            <div className="parent-phone-row">
              {child.parentPhone ? (
                <span className="parent-phone">
                  <Phone size={12} />
                  {child.parentPhone}
                </span>
              ) : (
                <span className="parent-phone no-phone">Tel yok</span>
              )}
              <button
                className="edit-phone-btn"
                onClick={() => setEditingPhone(true)}
                title="Telefon ekle/duzenle"
              >
                <Pencil size={12} />
              </button>
            </div>
          ) : (
            <div className="phone-edit-inline">
              <input
                type="tel"
                placeholder="Telefon numarasi"
                value={phoneValue}
                onChange={(e) => setPhoneValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdatePhone(child.id, phoneValue.trim());
                    setEditingPhone(false);
                  }
                }}
              />
              <button
                className="save-phone-btn"
                onClick={() => {
                  onUpdatePhone(child.id, phoneValue.trim());
                  setEditingPhone(false);
                }}
              >
                <Check size={14} />
              </button>
            </div>
          )}
        </div>
        <div className={`package-badge ${isUnlimited ? 'unlimited-badge' : ''}`}>
          {isUnlimited && <Infinity size={14} />} {child.packageLabel}
        </div>
      </div>

      {isUnlimited ? (
        <div className="timer-display unlimited-display">
          <Clock size={20} className="timer-icon" />
          <span className="timer-value">{formatTime(elapsed)}</span>
          <div className="unlimited-current-price">
            {formatPrice(getCurrentUnlimitedPrice())}
          </div>
        </div>
      ) : !isExpired ? (
        <div className="timer-display">
          <Clock size={20} className="timer-icon" />
          <span className="timer-value">{formatTime(remaining)}</span>
        </div>
      ) : (
        <div className="timer-display overtime-display">
          <div className="timer-expired-label">SURE DOLDU!</div>
          <div className={`overtime-counter ${overtimeMin <= toleranceMinutes ? 'tolerance' : 'billable'}`}>
            <TimerOff size={18} />
            <span className="overtime-label">Ekstra sure:</span>
            <span className="overtime-value">+{formatTime(overtime)}</span>
          </div>
          {overtimeMin <= toleranceMinutes ? (
            <div className="tolerance-hint">{toleranceMinutes} dk tolerans suresi icinde (ucretsiz)</div>
          ) : (
            <div className="billable-hint">Tolerans asimi! Ekstra ucret hesaplaniyor...</div>
          )}
        </div>
      )}

      {!isUnlimited && (
        <div className="timer-progress-bar">
          <div
            className="timer-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="timer-card-footer">
        {isUnlimited ? (
          <>
            <div className="timer-price">
              <span className="price-label">Gecen Sure:</span>
              <span className="price-value">{Math.ceil(elapsed / 60000)} dk</span>
            </div>
            {!showPickupConfirm ? (
              <button
                className="complete-btn"
                onClick={() => setShowPickupConfirm(true)}
              >
                Tamamla
              </button>
            ) : (
              <div className="pickup-confirm">
                <AlertTriangle size={16} />
                <span>Emin misiniz?</span>
                <button className="confirm-yes" onClick={handleUnlimitedComplete}>
                  Evet
                </button>
                <button className="confirm-no" onClick={() => setShowPickupConfirm(false)}>
                  Hayir
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="timer-price">
              <span className="price-label">Paket Ucreti:</span>
              <span className="price-value">{formatPrice(child.packagePrice)}</span>
            </div>

            {!isExpired && !showPickupConfirm && (
              <button
                className="early-pickup-btn"
                onClick={() => setShowPickupConfirm(true)}
              >
                <LogOut size={16} />
                Erken Al
              </button>
            )}

            {showPickupConfirm && (
              <div className="pickup-confirm">
                <AlertTriangle size={16} />
                <span>Emin misiniz?</span>
                <button className="confirm-yes" onClick={handleEarlyPickup}>
                  Evet
                </button>
                <button className="confirm-no" onClick={() => setShowPickupConfirm(false)}>
                  Hayir
                </button>
              </div>
            )}

            {isExpired && (
              <button className="complete-btn" onClick={handleOvertimeComplete}>
                Tamamla
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
