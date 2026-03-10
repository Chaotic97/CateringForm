import type { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  displayName: string;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/inquiries', label: 'Inquiries' },
  { path: '/menu', label: 'Menu' },
  { path: '/pricing', label: 'Pricing' },
];

export function AdminLayout({ children, currentPath, onNavigate, displayName, onLogout }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-tight">Sum Bar Admin</h1>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">{displayName}</p>
          <button onClick={onLogout} className="text-xs text-gray-500 hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
