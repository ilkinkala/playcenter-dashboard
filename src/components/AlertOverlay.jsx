import { useEffect } from 'react';
import { playAlertSound } from '../utils/sound';

export default function AlertOverlay({ child, onDismiss }) {
  useEffect(() => {
    playAlertSound(4000);
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="alert-overlay" onClick={onDismiss}>
      <div className="alert-content">
        <div className="alert-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="#fff" strokeWidth="4" />
            <path d="M40 20v24M40 52v4" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="alert-title">SÜRE DOLDU!</h1>
        <div className="alert-child-name">{child.childName}</div>
        <div className="alert-parent-name">Veli: {child.parentName}</div>
        <p className="alert-dismiss">Kapatmak için tıklayın</p>
      </div>
    </div>
  );
}
