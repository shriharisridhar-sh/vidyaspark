import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API = ''; // same origin

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    fetch(API + '/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUser(data.user);
          setCohorts(data.cohorts || []);
          setModules(data.modules || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const signup = async (name, email) => {
    const res = await fetch(API + '/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Signup failed');
    const data = await res.json();
    setUser(data.user);
    setCohorts(data.cohorts || []);
    setModules(data.modules || []);
    return data;
  };

  const login = async (email) => {
    const res = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    const data = await res.json();
    setUser(data.user);
    setCohorts(data.cohorts || []);
    setModules(data.modules || []);
    return data;
  };

  const joinCohort = async (code, name, email) => {
    const res = await fetch(API + '/api/cohorts/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, name, email }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Join failed');
    const data = await res.json();
    setUser(data.user);
    setCohorts(prev => [...prev, data.cohort]);
    setModules(data.modules || []);
    return data;
  };

  const logout = async () => {
    await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setCohorts([]);
    setModules([]);
  };

  const refreshAuth = async () => {
    const res = await fetch(API + '/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setCohorts(data.cohorts || []);
      setModules(data.modules || []);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, cohorts, modules, loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      signup, login, joinCohort, logout, refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
