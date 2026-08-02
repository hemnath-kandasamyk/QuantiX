import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { StatusStamp } from '../components/StatusStamp';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  CreditCard,
  DollarSign,
  QrCode,
  User,
  Percent,
  Search,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  sku: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const Billing: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Cart / Bill State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('card');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Receipt Modal State after sale
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await client.get('/products');
      setProducts(res.data);
    } catch {
      showToast('Error', 'Failed to load catalog for billing.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showToast('Out of Stock', `${product.name} has zero inventory remaining.`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast('Stock Limit Reached', `Only ${product.stock} ${product.unit}s available in stock.`, 'info');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              showToast('Stock Limit', `Cannot exceed available stock of ${item.product.stock}.`, 'info');
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * 0.08; // 8% sales tax
  const totalAmount = taxableAmount + taxAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Empty Cart', 'Please add at least one item to issue a receipt.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        paymentMethod,
        discountPercent,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const { data } = await client.post('/sales', payload);

      // Trigger Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast('Sale Recorded!', `Receipt ${data.receiptNo} created successfully.`);
      setCompletedSale(data);
      setCart([]);
      fetchProducts(); // refresh stock levels
    } catch {
      showToast('Checkout Failed', 'Could not record sale to ledger.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="pb-4 border-b border-[var(--color-rule)] flex items-center justify-between">
        <div>
          <span className="section-label">BILLING REGISTER & TILL RECEIPT</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)]">
            Create Invoice / Till Receipt
          </h1>
        </div>
        <div className="stamp stamp-amber text-xs">
          REGISTER: ACTIVE TILL
        </div>
      </div>

      {/* Grid: Left Product Picker & Cart Builder, Right Running Receipt Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Product Picker & Line Item Table (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Item Quick Selection */}
          <div className="ledger-card p-4 rounded">
            <h3 className="section-label mb-2">QUICK ITEM SELECTOR</h3>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product inventory..."
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
              />
            </div>

            {/* Product Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inCart = cart.find((item) => item.product.id === p.id);
                const isOutOfStock = p.stock <= 0;

                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={isOutOfStock}
                    className={`p-2.5 rounded text-left border text-xs transition-all flex flex-col justify-between ${
                      inCart
                        ? 'border-[var(--color-stamp-amber)] bg-[var(--color-stamp-amber-bg)]'
                        : isOutOfStock
                        ? 'opacity-40 border-[var(--color-rule-subtle)] bg-[var(--color-paper-subtle)] cursor-not-allowed'
                        : 'border-[var(--color-rule)] bg-[var(--color-paper-raised)] hover:border-[var(--color-text-muted)]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[var(--color-text-ink)] truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-[var(--color-text-muted)] font-mono-num">
                        ${p.price.toFixed(2)} / {p.unit}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono-num">
                      <span className={p.stock <= 5 ? 'text-[var(--color-stamp-red)] font-bold' : 'text-[var(--color-text-muted)]'}>
                        {isOutOfStock ? 'OUT' : `${p.stock} left`}
                      </span>
                      {inCart && (
                        <span className="px-1.5 py-0.2 rounded bg-[var(--color-stamp-amber)] text-[var(--color-ink)] font-bold">
                          x{inCart.quantity}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Line Items Table */}
          <div className="ledger-card p-4 rounded">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-rule-subtle)] mb-3">
              <span className="section-label">ACTIVE LINE ITEMS ({cart.length})</span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] font-mono-num text-[var(--color-stamp-red)] hover:underline font-bold"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-[var(--color-rule)] rounded">
                <p className="text-xs text-[var(--color-text-muted)] italic">
                  No line items selected. Click products above to build receipt.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded border border-[var(--color-rule-subtle)] bg-[var(--color-paper-subtle)] flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--color-text-ink)] truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[10px] font-mono-num text-[var(--color-text-muted)]">
                        ${item.product.price.toFixed(2)} × {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-[var(--color-rule)] rounded bg-[var(--color-paper-raised)] overflow-hidden font-mono-num">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-2 py-0.5 hover:bg-[var(--color-paper-subtle)] text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-[var(--color-text-ink)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-2 py-0.5 hover:bg-[var(--color-paper-subtle)] text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-[var(--color-stamp-red)] hover:bg-[var(--color-stamp-red-bg)] rounded"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Running Till Receipt Preview (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="ledger-card ledger-receipt-top p-6 rounded shadow-xl bg-[var(--color-paper-raised)] border border-[var(--color-rule)] font-mono-num relative">
            {/* Receipt Header Stamp */}
            <div className="text-center pb-4 border-b-2 border-dashed border-[var(--color-rule)] mb-4">
              <h2 className="font-serif-heading text-xl font-bold tracking-wider text-[var(--color-text-ink)]">
                MAIN STREET LEDGER
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
                Official Till Receipt
              </p>
              <div className="mt-2 inline-block stamp stamp-amber text-[9px] px-2 py-0.5">
                STATUS: UNCOMMITTED TILL
              </div>
            </div>

            {/* Customer & Payment Form inputs */}
            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="block section-label mb-1">Customer Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full pl-8 pr-2 py-1.5 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block section-label mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['card', 'cash', 'upi'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-2 rounded border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                        paymentMethod === method
                          ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)] shadow-xs'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {method === 'card' && <CreditCard className="w-3 h-3" />}
                      {method === 'cash' && <DollarSign className="w-3 h-3" />}
                      {method === 'upi' && <QrCode className="w-3 h-3" />}
                      <span>{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block section-label mb-1">Discount %</label>
                <div className="flex items-center gap-2">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`px-2.5 py-1 rounded border text-[11px] font-bold ${
                        discountPercent === d
                          ? 'border-[var(--color-stamp-amber)] bg-[var(--color-stamp-amber-bg)] text-[var(--color-stamp-amber)]'
                          : 'border-[var(--color-rule)] bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Running Receipt Item Breakdown */}
            <div className="py-3 border-t border-b border-[var(--color-rule-subtle)] my-4 text-xs space-y-1.5">
              <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                <span>ITEM</span>
                <span>QTY × PRICE</span>
              </div>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-[11px] text-[var(--color-text-ink)]">
                  <span className="truncate pr-2">{item.product.name}</span>
                  <span className="shrink-0 font-bold">
                    {item.quantity} × ${item.product.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Running Total Calculations with Dashed Divider */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-[var(--color-ledger-green)]">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Sales Tax (8%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t-2 border-dashed border-[var(--color-ink)] mt-2 flex justify-between items-baseline">
                <span className="font-serif-heading font-bold text-sm text-[var(--color-text-ink)]">
                  TOTAL TILL DUE:
                </span>
                <span className="font-serif-heading font-bold text-xl text-[var(--color-text-ink)]">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Complete Sale Action */}
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className="w-full mt-6 py-3 bg-[var(--color-ink)] hover:opacity-95 text-[var(--color-paper)] font-mono-num font-bold text-xs uppercase tracking-wider rounded transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
            >
              {isSubmitting ? (
                <span>Committing to QuantiX...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-ledger-green)]" />
                  <span>Commit & Print Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Completed Sale Printed Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="ledger-card receipt-serrated max-w-md w-full p-6 shadow-2xl bg-[var(--color-paper-raised)] border border-[var(--color-rule)] font-mono-num">
            <div className="text-center pb-4 border-b-2 border-dashed border-[var(--color-rule)] mb-4">
              <span className="stamp stamp-green text-[10px] mb-2 inline-block">
                ★ COMMITTED SALE RECEIPT
              </span>
              <h2 className="font-serif-heading text-2xl font-bold text-[var(--color-text-ink)] uppercase">
                QUANTIX STORE POS
              </h2>
              <p className="text-[10px] uppercase text-[var(--color-text-muted)]">
                Receipt #{completedSale.receiptNo}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                {new Date(completedSale.timestamp).toLocaleString()}
              </p>
            </div>

            <div className="text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Customer:</span>
                <span className="font-bold">{completedSale.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Payment Method:</span>
                <span className="font-bold uppercase">{completedSale.paymentMethod}</span>
              </div>
            </div>

            <div className="py-2 border-t border-b border-[var(--color-rule-subtle)] space-y-1 text-xs mb-4">
              {completedSale.items.map((it: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{it.productName} (x{it.quantity})</span>
                  <span className="font-bold">${it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs mb-6">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Subtotal:</span>
                <span>${completedSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>Tax:</span>
                <span>${completedSale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-[var(--color-rule)]">
                <span>Total Paid:</span>
                <span>${completedSale.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] text-[var(--color-text-ink)] font-mono-num text-xs font-bold rounded flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
