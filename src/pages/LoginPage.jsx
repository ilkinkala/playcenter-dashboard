import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import FoxLogo from '../components/FoxLogo';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Kullanici adi veya sifre hatali!');
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-shape login-shape-1" />
        <div className="login-shape login-shape-2" />
        <div className="login-shape login-shape-3" />
      </div>
      <div className={`login-card ${shaking ? 'shake' : ''}`}>
        <div className="login-logo">
          <div className="login-logo-icon">
            <FoxLogo size={64} />
          </div>
          <h1>Küçük Tilki</h1>
          <p className="login-subtitle">Çocuk Eğlence Merkezi Yönetim Paneli</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
