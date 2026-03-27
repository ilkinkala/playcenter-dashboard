import { createContext, useContext, useState, useEffect } from 'react';
import { getAdmin } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('kucuktilki_session');
    if (session === 'active') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  async function login(username, password) {
    const admin = await getAdmin();
    if (username === admin.username && password === admin.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('kucuktilki_session', 'active');
      return true;
    }
    return false;
  }

  function logout() {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kucuktilki_session');
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
