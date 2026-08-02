import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { StatusStamp } from '../components/StatusStamp';
import {
  Bell,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Info,
  Filter,
  Check,
} from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: string;
}

export const Alerts: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await client.get('/alerts');
      setAlerts(res.data);
    } catch {
      showToast('Error', 'Failed to fetch alerts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await client.post('/alerts/read-all');
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      showToast('Alerts Cleared', 'All inventory alerts marked as read.');
    } catch {
      showToast('Error', 'Failed to mark alerts as read.', 'error');
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await client.delete(`/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      showToast('Dismissed', 'Alert removed from system.');
    } catch {
      showToast('Error', 'Failed to dismiss alert.', 'error');
    }
  };

  const filteredAlerts = alerts.filter(
    (a) => severityFilter === 'ALL' || a.severity === severityFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-rule)]">
        <div>
          <span className="section-label">SYSTEM NOTIFICATIONS & STOCK AUDIT</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)]">
            Stock & Operational Alerts
          </h1>
        </div>

        {alerts.some((a) => !a.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all hover:opacity-90 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-[var(--color-ledger-green)]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="ledger-card p-4 rounded flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="section-label">SEVERITY FILTER:</span>
          {['ALL', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded text-xs font-mono-num font-bold uppercase transition-all ${
                severityFilter === sev
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono-num text-[var(--color-text-muted)]">
          {filteredAlerts.length} total alert(s)
        </span>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-20 shimmer rounded ledger-card"></div>
          <div className="h-20 shimmer rounded ledger-card"></div>
          <div className="h-20 shimmer rounded ledger-card"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Active Stock Alerts"
          description="All product stock thresholds are healthy and operating nominal."
          stampText="ALL CLEAR"
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isHigh = alert.severity === 'high';
            const isMedium = alert.severity === 'medium';

            return (
              <div
                key={alert.id}
                className={`ledger-card p-4 rounded transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 ${
                  isHigh
                    ? 'border-l-[var(--color-stamp-red)] bg-[var(--color-paper-raised)]'
                    : isMedium
                    ? 'border-l-[var(--color-stamp-amber)] bg-[var(--color-paper-raised)]'
                    : 'border-l-[var(--color-ledger-green)] bg-[var(--color-paper-raised)]'
                } ${!alert.read ? 'shadow-md' : 'opacity-80'}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {isHigh ? (
                      <AlertTriangle className="w-5 h-5 text-[var(--color-stamp-red)]" />
                    ) : isMedium ? (
                      <AlertTriangle className="w-5 h-5 text-[var(--color-stamp-amber)]" />
                    ) : (
                      <Info className="w-5 h-5 text-[var(--color-ledger-green)]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[var(--color-text-ink)]">
                        {alert.title}
                      </h3>
                      <StatusStamp
                        label={alert.severity}
                        variant={isHigh ? 'red' : isMedium ? 'amber' : 'green'}
                        animate={false}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      {alert.message}
                    </p>
                    <p className="text-[10px] font-mono-num text-[var(--color-text-muted)] mt-1">
                      Logged {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-stamp-red)] hover:bg-[var(--color-stamp-red-bg)] rounded transition-colors"
                    title="Dismiss Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
