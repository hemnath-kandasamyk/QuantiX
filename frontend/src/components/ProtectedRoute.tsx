import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
        <div className="ledger-card p-6 rounded text-center max-w-sm">
          <div className="w-8 h-8 border-2 border-[var(--color-stamp-amber)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-mono-num text-xs tracking-wider uppercase text-[var(--color-text-muted)]">
            Verifying QuantiX Access...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 text-center">
        <div className="ledger-card p-8 rounded border-red-300">
          <div className="w-12 h-12 rounded-full bg-[var(--color-stamp-red-bg)] text-[var(--color-stamp-red)] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-serif-heading text-xl text-[var(--color-text-ink)] mb-2">
            Restricted Access
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-6">
            The Staff Management ledger page requires Administrator permissions. Your account ({user.name}) is currently registered as <span className="font-bold uppercase font-mono-num">{user.role}</span>.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs font-mono-num uppercase tracking-wider rounded font-bold"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
