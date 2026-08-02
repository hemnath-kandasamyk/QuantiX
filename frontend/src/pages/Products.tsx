import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { StatusStamp } from '../components/StatusStamp';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  PlusCircle,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  reorderPoint: number;
  sku: string;
  unit: string;
}

export const Products: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    price: '',
    costPrice: '',
    stock: '',
    reorderPoint: '10',
    sku: '',
    unit: 'item',
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get('/products');
      setProducts(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch inventory catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Beverages',
      price: '',
      costPrice: '',
      stock: '20',
      reorderPoint: '10',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: 'item',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: String(product.price),
      costPrice: String(product.costPrice),
      stock: String(product.stock),
      reorderPoint: String(product.reorderPoint),
      sku: product.sku,
      unit: product.unit,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Validation Error', 'Product name and price are required.', 'error');
      return;
    }

    try {
      if (editingProduct) {
        const res = await client.put(`/products/${editingProduct.id}`, {
          ...formData,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice || 0),
          stock: Number(formData.stock || 0),
          reorderPoint: Number(formData.reorderPoint || 5),
        });
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.data : p)));
        showToast('Product Updated', `Updated details for ${formData.name}.`);
      } else {
        const res = await client.post('/products', {
          ...formData,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice || 0),
          stock: Number(formData.stock || 0),
          reorderPoint: Number(formData.reorderPoint || 5),
        });
        setProducts((prev) => [res.data, ...prev]);
        showToast('Product Added', `Registered ${formData.name} in ledger.`);
      }
      setIsAddModalOpen(false);
    } catch {
      showToast('Error', 'Failed to save product details.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) return;
    try {
      await client.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      showToast('Product Removed', `Deleted ${name} from ledger.`);
    } catch {
      showToast('Error', 'Failed to delete product.', 'error');
    }
  };

  // Bulk Actions
  const handleBulkAddStock = async () => {
    const qtyStr = window.prompt('Enter stock quantity to add to selected products:', '10');
    if (!qtyStr || isNaN(Number(qtyStr))) return;
    try {
      await client.patch('/products/bulk', {
        ids: selectedIds,
        action: 'stock_add',
        value: Number(qtyStr),
      });
      fetchProducts();
      showToast('Bulk Stock Updated', `Added +${qtyStr} stock to ${selectedIds.length} items.`);
      setSelectedIds([]);
    } catch {
      showToast('Error', 'Bulk update failed.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-rule)]">
        <div>
          <span className="section-label font-mono-num">INVENTORY CATALOG</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)]">
            Products & Inventory Management
          </h1>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Controls Bar: Search, Category Filter, Bulk Action Controls */}
      <div className="ledger-card p-4 rounded flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)] cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 bg-[var(--color-paper-subtle)] border border-[var(--color-stamp-amber)] rounded">
            <span className="text-[11px] font-mono-num font-bold text-[var(--color-stamp-amber)] px-2">
              {selectedIds.length} SELECTED
            </span>
            <button
              onClick={handleBulkAddStock}
              className="px-2.5 py-1 bg-[var(--color-paper-raised)] text-[var(--color-text-ink)] text-xs font-mono-num font-semibold rounded border border-[var(--color-rule)] hover:bg-[var(--color-paper)] flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[var(--color-ledger-green)]" /> + Add Stock
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Desktop Table & Mobile Receipt Cards */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products Found"
          description="There are no product records matching your query filter. Register your first inventory item to start tracking."
          actionLabel="Register New Item"
          onAction={handleOpenAddModal}
          stampText="NO RECORD"
        />
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block ledger-card rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--color-paper-subtle)] border-b border-[var(--color-rule)] font-mono-num text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]"
                    >
                      {selectedIds.length === filteredProducts.length ? (
                        <CheckSquare className="w-4 h-4 text-[var(--color-stamp-amber)]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Item Name & SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Stock Level Stamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-rule-subtle)]">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLow = p.stock <= p.reorderPoint;
                  const isCritical = p.stock <= 3;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[var(--color-paper-subtle)] transition-colors ${
                        isSelected ? 'bg-[var(--color-paper-subtle)]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[var(--color-stamp-amber)]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[var(--color-text-ink)]">
                        <div>{p.name}</div>
                        <div className="text-[10px] font-mono-num text-[var(--color-text-muted)]">
                          SKU: {p.sku}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-rule-subtle)] font-mono-num text-[10px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono-num font-bold text-[var(--color-text-ink)]">
                        ${p.price.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono-num">
                        <StatusStamp
                          label={`${p.stock} ${p.unit}s`}
                          variant={isCritical ? 'red' : isLow ? 'amber' : 'green'}
                          animate={false}
                        />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] hover:bg-[var(--color-paper-subtle)] rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-[var(--color-stamp-red)] hover:bg-[var(--color-stamp-red-bg)] rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Receipt Cards View (< 768px) */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((p) => {
              const isLow = p.stock <= p.reorderPoint;
              const isCritical = p.stock <= 3;

              return (
                <div key={p.id} className="ledger-card p-4 rounded flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[var(--color-text-ink)]">
                        {p.name}
                      </h3>
                      <p className="text-[10px] font-mono-num text-[var(--color-text-muted)]">
                        SKU: {p.sku} • {p.category}
                      </p>
                    </div>
                    <span className="font-serif-heading font-bold text-sm font-mono-num text-[var(--color-text-ink)]">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-rule-subtle)]">
                    <StatusStamp
                      label={`Stock: ${p.stock} ${p.unit}s`}
                      variant={isCritical ? 'red' : isLow ? 'amber' : 'green'}
                      animate={false}
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="text-xs font-mono-num text-[var(--color-text-ink)] hover:underline flex items-center gap-1 font-bold"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-xs font-mono-num text-[var(--color-stamp-red)] hover:underline flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="ledger-card max-w-lg w-full p-6 rounded-lg shadow-2xl bg-[var(--color-paper-raised)] border border-[var(--color-rule)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)] mb-4">
              <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
                {editingProduct ? 'Edit Inventory Item' : 'New Product Entry'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="block section-label mb-1">Product Title</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Colombian Coffee Beans"
                  required
                  className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block section-label mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Beverages"
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
                <div>
                  <label className="block section-label mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block section-label mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="28.50"
                    required
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
                <div>
                  <label className="block section-label mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="16.00"
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block section-label mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="20"
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
                <div>
                  <label className="block section-label mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
                <div>
                  <label className="block section-label mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="bag / loaf / jar"
                    className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-rule)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all hover:opacity-95"
                >
                  {editingProduct ? 'Save Changes' : 'Record Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
