import { useState, useEffect } from 'react';
import { UserPlus, Baby, Users, Clock, Phone, Infinity } from 'lucide-react';
import { getPackages, formatPrice } from '../utils/pricing';
import { initAudio } from '../utils/sound';

export default function AddChildForm({ onAdd }) {
  const [childName, setChildName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    getPackages().then(setPackages);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!childName.trim() || !parentName.trim() || selectedPackage === null) return;

    // Unlock audio on user click so alerts can play sound later
    initAudio();

    const now = Date.now();

    if (selectedPackage === 'unlimited') {
      onAdd({
        id: `child_${now}_${Math.random().toString(36).slice(2, 8)}`,
        childName: childName.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim() || '',
        packageLabel: 'Sinirsiz',
        packageMinutes: 0,
        packagePrice: 0,
        startTime: now,
        endTime: 0,
      });
    } else {
      const pkg = packages[selectedPackage];
      onAdd({
        id: `child_${now}_${Math.random().toString(36).slice(2, 8)}`,
        childName: childName.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim() || '',
        packageLabel: pkg.label,
        packageMinutes: pkg.minutes,
        packagePrice: pkg.price,
        startTime: now,
        endTime: now + pkg.minutes * 60 * 1000,
      });
    }

    setChildName('');
    setParentName('');
    setParentPhone('');
    setSelectedPackage(null);
  }

  return (
    <form className="add-child-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        <UserPlus size={22} />
        Yeni Cocuk Kaydi
      </h2>

      <div className="form-row">
        <div className="input-group">
          <Baby size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Cocuk Adi"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <Users size={18} className="input-icon" />
          <input
            type="text"
            placeholder="Veli Adi"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="input-group phone-input-group">
        <Phone size={18} className="input-icon" />
        <input
          type="tel"
          placeholder="Veli Telefon Numarasi (Opsiyonel)"
          value={parentPhone}
          onChange={(e) => setParentPhone(e.target.value)}
        />
      </div>

      <div className="package-selector">
        <p className="package-label">
          <Clock size={16} />
          Sure Secimi
        </p>
        <div className="package-options">
          {packages.map((pkg, idx) => (
            <button
              key={idx}
              type="button"
              className={`package-option ${selectedPackage === idx ? 'selected' : ''}`}
              onClick={() => setSelectedPackage(idx)}
            >
              <span className="package-time">{pkg.label}</span>
              <span className="package-price">{formatPrice(pkg.price)}</span>
            </button>
          ))}
          <button
            type="button"
            className={`package-option unlimited-option ${selectedPackage === 'unlimited' ? 'selected' : ''}`}
            onClick={() => setSelectedPackage('unlimited')}
          >
            <span className="package-time"><Infinity size={16} /> Sinirsiz</span>
            <span className="package-price">Sureli</span>
          </button>
        </div>
      </div>

      {selectedPackage !== null && selectedPackage !== 'unlimited' && (
        <div className="price-preview">
          <span>Odenecek Tutar:</span>
          <strong>{formatPrice(packages[selectedPackage].price)}</strong>
        </div>
      )}

      {selectedPackage === 'unlimited' && (
        <div className="price-preview">
          <span>Ucret kullanilan sureye gore hesaplanacak</span>
        </div>
      )}

      <button
        type="submit"
        className="submit-btn"
        disabled={!childName.trim() || !parentName.trim() || selectedPackage === null}
      >
        <UserPlus size={18} />
        Kaydi Baslat
      </button>
    </form>
  );
}
