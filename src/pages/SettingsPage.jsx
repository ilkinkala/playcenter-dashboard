import { useState, useEffect, useRef } from 'react';
import {
  getSettings, saveSettings, getAdmin, saveAdmin,
  exportBackup, importBackup,
} from '../utils/storage';
import { formatPrice } from '../utils/pricing';
import {
  Settings, DollarSign, Clock, Shield, Plus, Trash2,
  Save, Download, Upload, CheckCircle, AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const [packages, setPackages] = useState([]);
  const [tolerance, setTolerance] = useState(5);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      const settings = await getSettings();
      setPackages(settings.packages);
      setTolerance(settings.toleranceMinutes);
      const admin = await getAdmin();
      setUsername(admin.username);
    }
    load();
  }, []);

  function showSaved(msg) {
    setSavedMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSavedMsg(''), 3000);
  }

  function showError(msg) {
    setErrorMsg(msg);
    setSavedMsg('');
    setTimeout(() => setErrorMsg(''), 4000);
  }

  async function handleSavePackages() {
    // Validate
    for (const pkg of packages) {
      if (!pkg.label.trim()) return showError('Paket adi bos olamaz');
      if (pkg.minutes <= 0) return showError('Sure 0\'dan buyuk olmali');
      if (pkg.price <= 0) return showError('Fiyat 0\'dan buyuk olmali');
    }
    await saveSettings({ packages, toleranceMinutes: tolerance });
    showSaved('Paket fiyatlari kaydedildi');
  }

  async function handleSaveTolerance() {
    if (tolerance < 0) return showError('Tolerans 0\'dan kucuk olamaz');
    await saveSettings({ packages, toleranceMinutes: tolerance });
    showSaved('Tolerans suresi kaydedildi');
  }

  async function handleSavePassword() {
    const admin = await getAdmin();
    if (currentPassword !== admin.password) {
      return showError('Mevcut sifre yanlis');
    }
    if (!newPassword.trim()) return showError('Yeni sifre bos olamaz');
    if (newPassword !== confirmPassword) return showError('Sifreler eslemiyor');

    await saveAdmin({ username: admin.username, password: newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showSaved('Sifre basariyla degistirildi');
  }

  function handleAddPackage() {
    setPackages([...packages, { label: '', minutes: 30, price: 0 }]);
  }

  function handleRemovePackage(idx) {
    if (packages.length <= 1) return showError('En az bir paket olmali');
    setPackages(packages.filter((_, i) => i !== idx));
  }

  function updatePackage(idx, field, value) {
    const updated = [...packages];
    updated[idx] = { ...updated[idx], [field]: value };
    setPackages(updated);
  }

  async function handleExport() {
    const data = await exportBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kucuktilki-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSaved('Yedek dosyasi indirildi');
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        await importBackup(event.target.result);
        showSaved('Yedek basariyla yuklendi! Sayfa yenileniyor...');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showError('Gecersiz yedek dosyasi');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">
          <Settings size={24} />
          Ayarlar
        </h1>
      </div>

      {savedMsg && (
        <div className="settings-toast success">
          <CheckCircle size={16} />
          {savedMsg}
        </div>
      )}
      {errorMsg && (
        <div className="settings-toast error">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Packages */}
      <div className="settings-section">
        <h2 className="settings-section-title">
          <DollarSign size={20} />
          Paket Fiyatlari
        </h2>
        <div className="packages-editor">
          {packages.map((pkg, idx) => (
            <div key={idx} className="package-edit-row">
              <input
                type="text"
                placeholder="Paket Adi"
                value={pkg.label}
                onChange={(e) => updatePackage(idx, 'label', e.target.value)}
                className="pkg-input pkg-name"
              />
              <div className="pkg-field">
                <label>Dakika</label>
                <input
                  type="number"
                  min="1"
                  value={pkg.minutes}
                  onChange={(e) => updatePackage(idx, 'minutes', Number(e.target.value))}
                  className="pkg-input pkg-number"
                />
              </div>
              <div className="pkg-field">
                <label>Fiyat (TL)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={pkg.price}
                  onChange={(e) => updatePackage(idx, 'price', Number(e.target.value))}
                  className="pkg-input pkg-number"
                />
              </div>
              <button
                className="pkg-remove"
                onClick={() => handleRemovePackage(idx)}
                title="Paketi Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div className="package-edit-actions">
            <button className="settings-btn secondary" onClick={handleAddPackage}>
              <Plus size={16} />
              Yeni Paket Ekle
            </button>
            <button className="settings-btn primary" onClick={handleSavePackages}>
              <Save size={16} />
              Fiyatlari Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Tolerance */}
      <div className="settings-section">
        <h2 className="settings-section-title">
          <Clock size={20} />
          Tolerans Suresi
        </h2>
        <p className="settings-desc">
          Sure dolduktan sonra ekstra ucret hesaplanmadan once beklenecek tolerans suresi.
        </p>
        <div className="tolerance-editor">
          <input
            type="number"
            min="0"
            max="60"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value))}
            className="pkg-input pkg-number"
          />
          <span className="tolerance-unit">dakika</span>
          <button className="settings-btn primary" onClick={handleSaveTolerance}>
            <Save size={16} />
            Kaydet
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="settings-section">
        <h2 className="settings-section-title">
          <Shield size={20} />
          Sifre Degistir
        </h2>
        <div className="password-editor">
          <div className="settings-field">
            <label>Kullanici Adi</label>
            <input type="text" value={username} disabled className="pkg-input" />
          </div>
          <div className="settings-field">
            <label>Mevcut Sifre</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pkg-input"
              placeholder="Mevcut sifrenizi girin"
            />
          </div>
          <div className="settings-field">
            <label>Yeni Sifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pkg-input"
              placeholder="Yeni sifre"
            />
          </div>
          <div className="settings-field">
            <label>Yeni Sifre (Tekrar)</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pkg-input"
              placeholder="Yeni sifreyi tekrarlayin"
            />
          </div>
          <button className="settings-btn primary" onClick={handleSavePassword}>
            <Save size={16} />
            Sifreyi Degistir
          </button>
        </div>
      </div>

      {/* Backup/Restore */}
      <div className="settings-section">
        <h2 className="settings-section-title">
          <Download size={20} />
          Yedekleme / Geri Yukleme
        </h2>
        <p className="settings-desc">
          Tum verileri (gecmis kayitlar, ayarlar, aktif cocuklar) yedekleyin veya geri yukleyin.
        </p>
        <div className="backup-actions">
          <button className="settings-btn primary" onClick={handleExport}>
            <Download size={16} />
            Yedek Indir
          </button>
          <button className="settings-btn secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} />
            Yedek Yukle
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
