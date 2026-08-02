import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { StatCard } from '../components/StatCard';
import { SkeletonStatCard, SkeletonTable } from '../components/Skeleton';
import { StatusStamp } from '../components/StatusStamp';
import {
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Receipt,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  lowStockCount: number;
  revenueChange: number;
  salesChange: number;
  revenueData: { date: string; revenue: number; transactions: number }[];
  topProducts: { name: string; salesCount: number; revenue: number; stock: number; unit: string }[];
  recentTransactions: {
    id: string;
    receiptNo: string;
    customerName: string;
    total: number;
    paymentMethod: string;
    timestamp: string;
    items: { productName: string; quantity: number }[];
  }[];
}

type TimeRange = 'today' | '7d' | '30d' | 'year';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>('7d');
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/dashboard');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [range]);

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-rule)]">
        <div>
          <span className="section-label">DAILY SUMMARY & QUANTIX AUDIT</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)]">
            Store Executive Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Animated Range Toggle Pills */}
          <div className="ledger-card p-1 rounded flex items-center bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] relative">
            {(['today', '7d', '30d', 'year'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`relative px-3 py-1 text-xs font-mono-num font-semibold uppercase tracking-wider rounded transition-all z-10 ${
                  range === r
                    ? 'text-[var(--color-paper)] bg-[var(--color-ink)] shadow-xs'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'Year'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 ledger-card rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] transition-colors"
            title="Refresh Ledger Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state if API call failed */}
      {error && (
        <div className="ledger-card p-6 rounded border-red-300 bg-[var(--color-stamp-red-bg)] text-[var(--color-stamp-red)] flex flex-col items-center text-center max-w-lg mx-auto">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <h3 className="font-serif-heading text-lg font-bold mb-1">
            Couldn't load sales ledger
          </h3>
          <p className="text-xs mb-4 opacity-90">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-[var(--color-stamp-red)] text-white text-xs font-mono-num font-bold rounded uppercase tracking-wider"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : data ? (
          <>
            <StatCard
              title="Total Revenue"
              value={`$${data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              changePercent={data.revenueChange}
              changePeriodLabel="vs last week"
              icon={DollarSign}
            />
            <StatCard
              title="Completed Register Sales"
              value={data.totalSales.toLocaleString()}
              changePercent={data.salesChange}
              changePeriodLabel="vs last week"
              icon={ShoppingBag}
            />
            <StatCard
              title="Active Inventory Lines"
              value={data.totalProducts}
              subtext="Healthy catalog depth"
              icon={Package}
            />
            <StatCard
              title="Low Stock Alerts"
              value={data.lowStockCount}
              subtext={data.lowStockCount > 0 ? 'Requires reorder attention' : 'All stock levels nominal'}
              icon={AlertTriangle}
            />
          </>
        ) : null}
      </div>

      {/* Main Revenue Chart & Action Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Line Chart with Gradient Fill */}
        <div className="lg:col-span-2 ledger-card p-5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-rule-subtle)]">
            <div>
              <span className="section-label">SALES REVENUE TREND</span>
              <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
                Daily Till Gross Income
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="stamp stamp-green text-[10px]">
                <TrendingUp className="w-3 h-3" /> GROSS INFLOW
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {loading ? (
              <div className="h-full w-full shimmer rounded"></div>
            ) : data ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ledgerRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-stamp-amber)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-stamp-amber)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-rule-subtle)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="IBM Plex Mono"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    fontSize={11}
                    fontFamily="IBM Plex Mono"
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-paper-raised)',
                      borderColor: 'var(--color-rule)',
                      borderRadius: '4px',
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '12px',
                      boxShadow: 'var(--shadow-popover)',
                    }}
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-stamp-amber)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#ledgerRevenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Right Side: Quick Action & Till Shortcut */}
        <div className="space-y-4">
          <div className="ledger-card p-5 rounded bg-[var(--color-paper-subtle)] border-l-4 border-l-[var(--color-stamp-amber)] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-5 h-5 text-[var(--color-stamp-amber)]" />
                <span className="section-label">NEW TRANSACTION</span>
              </div>
              <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)] mb-2">
                Open Billing Register
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">
                Record new sales, issue itemized paper-styled receipts, apply discounts, and instantly deduct inventory stock in real time.
              </p>
            </div>

            <button
              onClick={() => navigate('/billing')}
              className="w-full py-2.5 px-4 bg-[var(--color-ink)] hover:opacity-95 text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Issue New Receipt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Products & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Inventory */}
        <div className="ledger-card p-5 rounded">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule-subtle)] mb-4">
            <div>
              <span className="section-label">TOP PERFORMANCE</span>
              <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
                Highest Grossing Items
              </h3>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs font-mono-num text-[var(--color-stamp-amber)] hover:underline font-bold"
            >
              All Products →
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={4} cols={3} />
          ) : data && data.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-rule)] text-[var(--color-text-muted)] font-mono-num uppercase">
                    <th className="py-2 px-2">Item</th>
                    <th className="py-2 px-2 text-right">Stock Status</th>
                    <th className="py-2 px-2 text-right">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-rule-subtle)]">
                  {data.topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[var(--color-paper-subtle)] transition-colors">
                      <td className="py-2.5 px-2 font-medium text-[var(--color-text-ink)]">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-num">
                        <StatusStamp
                          label={`${p.stock} ${p.unit}s`}
                          variant={p.stock <= 5 ? 'red' : p.stock <= 15 ? 'amber' : 'green'}
                          animate={false}
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-num font-bold text-[var(--color-text-ink)]">
                        ${p.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        {/* Recent Till Receipts */}
        <div className="ledger-card p-5 rounded">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule-subtle)] mb-4">
            <div>
              <span className="section-label">RECENT TILL TRANSACTIONS</span>
              <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
                Recorded Receipts
              </h3>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="text-xs font-mono-num text-[var(--color-stamp-amber)] hover:underline font-bold"
            >
              Sales History →
            </button>
          </div>

          {loading ? (
            <SkeletonTable rows={4} cols={3} />
          ) : data && data.recentTransactions.length > 0 ? (
            <div className="space-y-2.5">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded border border-[var(--color-rule-subtle)] bg-[var(--color-paper-subtle)] flex items-center justify-between hover:border-[var(--color-rule)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[var(--color-paper-raised)] border border-[var(--color-rule-subtle)] font-mono-num text-[10px] font-bold">
                      {tx.receiptNo}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-text-ink)]">
                        {tx.customerName || 'Walk-in Customer'}
                      </h4>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-mono-num">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-serif-heading font-bold text-sm text-[var(--color-text-ink)] font-mono-num">
                      ${tx.total.toFixed(2)}
                    </span>
                    <div>
                      <span className="stamp stamp-green text-[9px] px-1 py-0">
                        PAID
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
