import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { InquiryList } from './pages/InquiryList';
import { InquiryDetail } from './pages/InquiryDetail';
import { MenuManager } from './pages/MenuManager';
import { PricingEditor } from './pages/PricingEditor';
import { Settings } from './pages/Settings';
import { AdminLayout } from './components/AdminLayout';

function getHashPath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const [path, setPath] = useState(getHashPath);

  useEffect(() => {
    const handler = () => setPath(getHashPath());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  const renderPage = () => {
    if (path === '/' || path === '') return <Dashboard onNavigate={navigate} />;

    if (path.startsWith('/inquiries/')) {
      const id = path.split('/')[2];
      return <InquiryDetail id={id} onNavigate={navigate} />;
    }

    if (path.startsWith('/inquiries')) {
      const params = new URLSearchParams(path.split('?')[1] || '');
      return <InquiryList onNavigate={navigate} initialStatus={params.get('status') || undefined} />;
    }

    if (path === '/menu') return <MenuManager />;
    if (path === '/pricing') return <PricingEditor />;
    if (path === '/settings') return <Settings />;

    return <Dashboard onNavigate={navigate} />;
  };

  return (
    <AdminLayout currentPath={path.split('?')[0]} onNavigate={navigate} displayName={user.displayName} onLogout={logout}>
      {renderPage()}
    </AdminLayout>
  );
}
