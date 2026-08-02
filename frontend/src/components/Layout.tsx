import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  LayoutDashboard,
  Package,
  Receipt,
  History,
  Bell,
  Bot,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  BookOpen,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: string;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [alertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState<boolean>(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products & Inventory', path: '/products', icon: Package },
    { label: 'Billing / Receipt', path: '/billing', icon: Receipt },
    { label: 'Sales History', path: '/sales', icon: History },
    { label: 'Alerts', path: '/alerts', icon: Bell, badgeCount: alerts.filter((a) => !a.read).length },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Staff Management', path: '/staff', icon: Users, adminOnly: true },
  ];

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const { data } = await client.get('/alerts');
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch {
      // Fallback alerts if server is booting
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAlertsOpen(false);
  }, [location.pathname]);

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const handleMarkAllRead = async () => {
    try {
      await client.post('/alerts/read-all');
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    } catch {
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-paper)] text-[var(--color-text-ink)]">
      {/* Skip to Content Link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-[var(--color-stamp-amber)] text-[var(--color-ink)] font-mono-num font-bold text-xs uppercase tracking-wider rounded shadow-md"
      >
        Skip to main content
      </a>

      {/* Top Bar for Mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-paper-raised)] border-b border-[var(--color-rule)] sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center font-serif-heading text-lg font-bold">
            Q
          </div>
          <div>
            <h1 className="font-serif-heading text-base font-bold text-[var(--color-text-ink)] leading-tight">
              QuantiX
            </h1>
            <p className="section-label text-[10px] leading-none">
              {user?.shopName || 'QuantiX Store'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell Mobile */}
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] relative rounded"
            aria-label={`View alerts (${unreadAlertsCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-stamp-red)] rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--color-text-ink)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-stamp-amber)]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-[#1B2432] text-[#FAF8F3] border-r border-[#2C384B] flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } h-screen`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header Branding */}
          <div className="p-5 border-b border-[#2C384B] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-[#DCD6C8] text-[#1B2432] flex items-center justify-center font-serif-heading text-xl font-bold shadow-xs">
                Q
              </div>
              <div>
                <h1 className="font-serif-heading text-lg font-bold text-[#FAF8F3] tracking-wide leading-tight">
                  QUANTIX
                </h1>
                <p className="font-mono-num text-[10px] tracking-widest text-[#9CA3AF] uppercase">
                  {user?.shopName || 'QuantiX Store'}
                </p>
              </div>
            </div>

            {/* Close button for mobile inside drawer */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-[#9CA3AF] hover:text-[#FAF8F3] p-1 rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Ribbon */}
          {user && (
            <div className="px-5 py-3 bg-[#11161F]/60 border-b border-[#2C384B] flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-[#FAF8F3] truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-[#9CA3AF] truncate">
                  {user.email}
                </p>
              </div>
              <span
                className={`stamp ${
                  user.role === 'admin' ? 'stamp-amber' : 'stamp-green'
                } text-[10px] px-1.5 py-0.5`}
              >
                {user.role}
              </span>
            </div>
          )}

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5 flex-1" aria-label="Main Navigation">
            {navItems.map((item, idx) => {
              if (item.adminOnly && user?.role !== 'admin') {
                return null;
              }
              const Icon = item.icon;
              const indexStr = String(idx + 1).padStart(2, '0');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#FAF8F3] text-[#1B2432] font-semibold shadow-xs'
                        : 'text-[#D1D5DB] hover:bg-[#2A3649] hover:text-[#FAF8F3]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono-num text-[10px] opacity-60">{indexStr}</span>
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono-num font-bold rounded-full bg-[#B91C1C] text-white">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer & Controls */}
          <div className="p-4 border-t border-[#2C384B] space-y-2.5 bg-[#11161F]/40">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs text-[#FAF8F3] hover:bg-[#2A3649] transition-colors border border-[#2C384B]"
              aria-label={`Switch to ${theme === 'light' ? 'Dark Night Ledger' : 'Light Paper'} theme`}
            >
              <div className="flex items-center gap-2">
                {theme === 'light' ? <Moon className="w-4 h-4 text-[#F59E0B]" /> : <Sun className="w-4 h-4 text-[#F59E0B]" />}
                <span className="font-mono-num text-[11px] uppercase tracking-wider font-medium">
                  {theme === 'light' ? 'Night Mode' : 'Paper Theme'}
                </span>
              </div>
              <span className="text-[10px] text-[#9CA3AF] font-mono-num">
                {theme.toUpperCase()}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs text-[#EF4444] hover:bg-[#3F1717] transition-colors font-medium border border-transparent hover:border-[#EF4444]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-[var(--color-rule)] bg-[var(--color-paper-raised)] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[var(--color-stamp-amber)]" />
            <h2 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
              {navItems.find((n) => n.path === location.pathname)?.label || 'QuantiX Shop Book'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Alerts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAlertsOpen(!alertsOpen)}
                className="p-2 rounded bg-[var(--color-paper-subtle)] hover:bg-[var(--color-rule-subtle)] border border-[var(--color-rule)] transition-colors relative"
                aria-label={`View alerts popup (${unreadAlertsCount} unread)`}
                aria-expanded={alertsOpen}
              >
                <Bell className="w-4 h-4 text-[var(--color-text-ink)]" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-mono-num font-bold rounded-full bg-[var(--color-stamp-red)] text-white animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown Popup */}
              {alertsOpen && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="absolute right-0 mt-2 w-80 md:w-96 ledger-card rounded p-4 z-50 shadow-xl border border-[var(--color-rule)] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule)] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="section-label">System Alerts</span>
                      {unreadAlertsCount > 0 && (
                        <span className="stamp stamp-red text-[9px] px-1 py-0">
                          {unreadAlertsCount} NEW
                        </span>
                      )}
                    </div>
                    {unreadAlertsCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-mono-num text-[var(--color-ledger-green)] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  {alerts.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-muted)] py-4 text-center italic">
                      No system alerts recorded. Everything is operating smoothly.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {alerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-2.5 rounded text-xs border ${
                            !alert.read
                              ? 'bg-[var(--color-paper-subtle)] border-[var(--color-stamp-amber)]'
                              : 'bg-[var(--color-paper-raised)] border-[var(--color-rule-subtle)] opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[var(--color-text-ink)] truncate">
                              {alert.title}
                            </span>
                            <span
                              className={`stamp ${
                                alert.severity === 'high'
                                  ? 'stamp-red'
                                  : alert.severity === 'medium'
                                  ? 'stamp-amber'
                                  : 'stamp-green'
                              } text-[9px] px-1 py-0`}
                            >
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2">
                            {alert.message}
                          </p>
                          <p className="text-[9px] font-mono-num text-[var(--color-text-muted)] mt-1 text-right">
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 mt-3 border-t border-[var(--color-rule)] text-center">
                    <button
                      onClick={() => {
                        setAlertsOpen(false);
                        navigate('/alerts');
                      }}
                      className="text-xs font-mono-num font-bold text-[var(--color-ink)] hover:underline uppercase tracking-wider"
                    >
                      View All Alerts Ledger →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shop Code Stamp */}
            <div className="stamp stamp-amber text-xs">
              SHOP: {user?.shopCode || 'QX-101'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main id="main-content" className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
