import { useState, useEffect, useCallback } from 'react';
import AddChildForm from '../components/AddChildForm';
import TimerCard from '../components/TimerCard';
import AlertOverlay from '../components/AlertOverlay';
import CompletionModal from '../components/CompletionModal';
import { getActiveChildren, saveActiveChildren, addChild as addChildDB, removeChild as removeChildDB, addToHistory } from '../utils/storage';
import { startTabFlash, stopTabFlash } from '../utils/tabNotification';
import { Users } from 'lucide-react';

export default function DashboardPage() {
  const [children, setChildren] = useState([]);
  const [alertChild, setAlertChild] = useState(null);
  const [completionRecord, setCompletionRecord] = useState(null);
  const [expiredSet, setExpiredSet] = useState(new Set());

  useEffect(() => {
    getActiveChildren().then(setChildren);
  }, []);

  async function handleAddChild(child) {
    await addChildDB(child);
    const updated = [...children, child];
    setChildren(updated);
  }

  const handleTimeUp = useCallback((child) => {
    setExpiredSet((prev) => {
      if (prev.has(child.id)) return prev;
      const next = new Set(prev);
      next.add(child.id);
      setAlertChild(child);
      startTabFlash(child.childName);
      return next;
    });
  }, []);

  function handleDismissAlert() {
    setAlertChild(null);
    stopTabFlash();
  }

  async function handleComplete(child, pricing) {
    const record = {
      id: `record_${Date.now()}`,
      childName: child.childName,
      parentName: child.parentName,
      parentPhone: child.parentPhone || '',
      packageLabel: child.packageLabel,
      packageMinutes: child.packageMinutes,
      packagePrice: pricing.packagePrice,
      startTime: child.startTime,
      endTime: Date.now(),
      usedMinutes: pricing.usedMinutes,
      type: pricing.type,
      overtimeMinutes: pricing.overtimeMinutes,
      overtimePrice: pricing.overtimePrice,
      finalPrice: pricing.finalPrice,
      completedAt: new Date().toISOString(),
    };

    await addToHistory(record);
    setCompletionRecord(record);

    await removeChildDB(child.id);
    const updated = children.filter((c) => c.id !== child.id);
    setChildren(updated);

    setExpiredSet((prev) => {
      const next = new Set(prev);
      next.delete(child.id);
      return next;
    });

    stopTabFlash();
  }

  async function handleUpdatePhone(childId, phone) {
    const updated = children.map((c) =>
      c.id === childId ? { ...c, parentPhone: phone } : c
    );
    setChildren(updated);
    await saveActiveChildren(updated);
  }

  return (
    <div className="dashboard">
      <AddChildForm onAdd={handleAddChild} />

      <div className="active-section">
        <h2 className="section-title">
          <Users size={22} />
          Aktif Çocuklar
          {children.length > 0 && (
            <span className="count-badge">{children.length}</span>
          )}
        </h2>

        {children.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="#ddd" strokeWidth="2" strokeDasharray="4 4"/>
                <path d="M22 28c0-1.1.9-2 2-2s2 .9 2 2M38 28c0-1.1.9-2 2-2s2 .9 2 2" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                <path d="M24 38c0 0 2 4 8 4s8-4 8-4" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>Henüz aktif çocuk kaydı yok</p>
            <p className="empty-hint">Yukarıdaki formu kullanarak yeni kayıt ekleyin</p>
          </div>
        ) : (
          <div className="timer-grid">
            {children.map((child) => (
              <TimerCard
                key={child.id}
                child={child}
                onTimeUp={handleTimeUp}
                onComplete={handleComplete}
                onUpdatePhone={handleUpdatePhone}
              />
            ))}
          </div>
        )}
      </div>

      {alertChild && (
        <AlertOverlay child={alertChild} onDismiss={handleDismissAlert} />
      )}

      {completionRecord && (
        <CompletionModal
          record={completionRecord}
          onClose={() => setCompletionRecord(null)}
        />
      )}
    </div>
  );
}
