import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { StatusStamp } from '../components/StatusStamp';
import {
  History,
  Search,
  Download,
  Calendar,
  Eye,
  Filter,
  CreditCard,
  DollarSign,
  QrCode,
  X,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  receiptNo: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'PAID' | 'REFUNDED';
  timestamp: string;
}

export const SalesHistory: React.FC = () => {
  const { showToast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Selected Sale for Detail Modal
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await client.get('/sales');
      setSales(res.data);
    } catch {
      showToast('Error', 'Failed to fetch sales history ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'ALL' || s.paymentMethod === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export to CSV helper
  const handleExportCSV = () => {
    if (sales.length === 0) {
      showToast('Export Error', 'No sales data to export.', 'error');
      return;
    }

    const headers = ['Receipt No', 'Customer', 'Items Count', 'Payment Method', 'Total ($)', 'Date'];
    const rows = sales.map((s) => [
      s.receiptNo,
      `"${s.customerName}"`,
      s.items.length,
      s.paymentMethod,
      s.total.toFixed(2),
      new Date(s.timestamp).toLocaleString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quantix_sales_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported CSV', 'Sales records exported to file.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-rule)]">
        <div>
          <span className="section-label">SALES AUDIT TRAIL</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)]">
            Sales & Transaction History
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] hover:border-[var(--color-text-muted)] text-[var(--color-text-ink)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4 text-[var(--color-stamp-amber)]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="ledger-card p-4 rounded flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by receipt # or customer name..."
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="section-label">METHOD:</span>
          {['ALL', 'card', 'cash', 'upi'].map((m) => (
            <button
              key={m}
              onClick={() => {
                setPaymentFilter(m);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded text-xs font-mono-num font-bold uppercase transition-all ${
                paymentFilter === m
                  ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
                  : 'bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Table / Cards */}
      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : filteredSales.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Transactions Recorded"
          description="There are no completed sales matching your filter criteria."
          stampText="NO SALES"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block ledger-card rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-paper-subtle)] border-b border-[var(--color-rule)] font-mono-num text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Amount ($)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule-subtle)]">
                {paginatedSales.map((s) => (
                  <tr key={s.id} className="hover:bg-[var(--color-paper-subtle)] transition-colors">
                    <td className="py-3.5 px-4 font-mono-num font-bold text-[var(--color-text-ink)]">
                      {s.receiptNo}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--color-text-ink)] font-medium">
                      {s.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono-num uppercase">
                      <span className="px-2 py-0.5 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-rule-subtle)] text-[10px]">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-num text-[var(--color-text-muted)]">
                      {new Date(s.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[var(--color-text-ink)]">
                      ${s.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono-num">
                      <StatusStamp label={s.status} variant="green" animate={false} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSale(s)}
                        className="px-2.5 py-1 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] hover:border-[var(--color-text-muted)] text-xs font-mono-num font-semibold text-[var(--color-text-ink)] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Receipt Cards View */}
          <div className="md:hidden space-y-3">
            {paginatedSales.map((s) => (
              <div key={s.id} className="ledger-card p-4 rounded flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono-num font-bold text-xs text-[var(--color-text-ink)]">
                      {s.receiptNo}
                    </span>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {s.customerName}
                    </p>
                  </div>
                  <span className="font-serif-heading font-bold text-base font-mono-num text-[var(--color-text-ink)]">
                    ${s.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-rule-subtle)] text-[10px] font-mono-num">
                  <span className="text-[var(--color-text-muted)]">
                    {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.paymentMethod.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setSelectedSale(s)}
                    className="text-xs font-bold text-[var(--color-stamp-amber)] hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs font-mono-num text-[var(--color-text-muted)]">
                Page {currentPage} of {totalPages} ({filteredSales.length} records)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded border border-[var(--color-rule)] bg-[var(--color-paper-subtle)] disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded border border-[var(--color-rule)] bg-[var(--color-paper-subtle)] disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="ledger-card max-w-md w-full p-6 rounded-lg shadow-2xl bg-[var(--color-paper-raised)] border border-[var(--color-rule)] font-mono-num">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)] mb-4">
              <div>
                <span className="section-label">RECEIPT AUDIT</span>
                <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
                  #{selectedSale.receiptNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Customer:</span>
                <span className="font-bold">{selectedSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Method:</span>
                <span className="font-bold uppercase">{selectedSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Timestamp:</span>
                <span>{new Date(selectedSale.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="py-2 border-t border-b border-[var(--color-rule-subtle)] space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-bold uppercase">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              {selectedSale.items.map((it, i) => (
                <div key={i} className="flex justify-between text-[var(--color-text-ink)]">
                  <span>{it.productName} (x{it.quantity})</span>
                  <span className="font-bold">${it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs mb-6">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Subtotal:</span>
                <span>${selectedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Tax:</span>
                <span>${selectedSale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--color-rule)]">
                <span>Grand Total:</span>
                <span>${selectedSale.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSale(null)}
              className="w-full py-2 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
