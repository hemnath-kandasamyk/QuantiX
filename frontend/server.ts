import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Simulated Data Store for Ledger Shop
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  reorderPoint: number;
  sku: string;
  barcode?: string;
  unit: string;
}

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

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

// Initial Mock Database State
let products: Product[] = [
  { id: 'prod_1', name: 'Organic Colombian Coffee Beans (1kg)', category: 'Beverages', price: 28.50, costPrice: 16.00, stock: 45, reorderPoint: 15, sku: 'COF-COL-01', unit: 'bag' },
  { id: 'prod_2', name: 'Artisan Sourdough Loaf', category: 'Bakery', price: 6.50, costPrice: 2.20, stock: 8, reorderPoint: 10, sku: 'BAK-SRD-02', unit: 'loaf' },
  { id: 'prod_3', name: 'Matcha Green Tea Powder (250g)', category: 'Beverages', price: 22.00, costPrice: 12.00, stock: 3, reorderPoint: 8, sku: 'TEA-MCH-03', unit: 'can' },
  { id: 'prod_4', name: 'Raw Honey Jar (500ml)', category: 'Pantry', price: 14.00, costPrice: 7.50, stock: 24, reorderPoint: 10, sku: 'PAN-HNY-04', unit: 'jar' },
  { id: 'prod_5', name: 'Oat Milk Barista Edition (1L)', category: 'Dairy/Alt', price: 4.80, costPrice: 2.50, stock: 62, reorderPoint: 20, sku: 'ALT-OAT-05', unit: 'carton' },
  { id: 'prod_6', name: 'Almond Croissant', category: 'Bakery', price: 4.20, costPrice: 1.50, stock: 5, reorderPoint: 12, sku: 'BAK-CRS-06', unit: 'piece' },
  { id: 'prod_7', name: 'Dark Chocolate 85% (100g)', category: 'Snacks', price: 5.50, costPrice: 2.80, stock: 30, reorderPoint: 10, sku: 'SNK-CHO-07', unit: 'bar' },
];

let sales: Sale[] = [
  {
    id: 'sale_101',
    receiptNo: 'REC-2026-001',
    customerName: 'Eleanor Vance',
    customerPhone: '+1 555-0192',
    items: [
      { productId: 'prod_1', productName: 'Organic Colombian Coffee Beans (1kg)', quantity: 2, unitPrice: 28.50, totalPrice: 57.00 },
      { productId: 'prod_5', productName: 'Oat Milk Barista Edition (1L)', quantity: 3, unitPrice: 4.80, totalPrice: 14.40 },
    ],
    subtotal: 71.40,
    tax: 5.71,
    discount: 0,
    total: 77.11,
    paymentMethod: 'card',
    status: 'PAID',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sale_102',
    receiptNo: 'REC-2026-002',
    customerName: 'Marcus Wright',
    customerPhone: '+1 555-0841',
    items: [
      { productId: 'prod_2', productName: 'Artisan Sourdough Loaf', quantity: 1, unitPrice: 6.50, totalPrice: 6.50 },
      { productId: 'prod_4', productName: 'Raw Honey Jar (500ml)', quantity: 1, unitPrice: 14.00, totalPrice: 14.00 },
    ],
    subtotal: 20.50,
    tax: 1.64,
    discount: 2.00,
    total: 20.14,
    paymentMethod: 'cash',
    status: 'PAID',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
];

let alerts: Alert[] = [
  { id: 'alt_1', title: 'Critical Stock: Matcha Green Tea', message: 'Matcha Green Tea Powder has 3 cans remaining (reorder point is 8).', severity: 'high', read: false, createdAt: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 'alt_2', title: 'Low Stock: Artisan Sourdough', message: 'Artisan Sourdough Loaf has 8 loaves remaining (reorder point is 10).', severity: 'medium', read: false, createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
  { id: 'alt_3', title: 'Low Stock: Almond Croissant', message: 'Almond Croissant has 5 pieces remaining (reorder point is 12).', severity: 'high', read: false, createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString() },
];

let staffMembers: StaffMember[] = [
  { id: 'stf_1', name: 'Eleanor Vance', email: 'eleanor@ledger.shop', role: 'admin', phone: '+1 555-0101', status: 'ACTIVE', joinedDate: '2025-01-15' },
  { id: 'stf_2', name: 'James Montgomery', email: 'james@ledger.shop', role: 'staff', phone: '+1 555-0102', status: 'ACTIVE', joinedDate: '2025-03-20' },
  { id: 'stf_3', name: 'Sophia Chen', email: 'sophia@ledger.shop', role: 'staff', phone: '+1 555-0103', status: 'ACTIVE', joinedDate: '2025-06-10' },
];

// Helper to auto-generate alerts when stock is low
function syncStockAlerts() {
  products.forEach((p) => {
    if (p.stock <= p.reorderPoint) {
      const existingAlert = alerts.find((a) => a.title.includes(p.name));
      if (!existingAlert) {
        alerts.unshift({
          id: 'alt_' + Date.now() + Math.random().toString(36).substring(2, 5),
          title: `Low Stock Alert: ${p.name}`,
          message: `${p.name} has only ${p.stock} ${p.unit}(s) left in stock (reorder threshold: ${p.reorderPoint}).`,
          severity: p.stock <= 3 ? 'high' : 'medium',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
}

// Check stock alerts on boot
syncStockAlerts();

// --- API ROUTES ---

// 1. Auth Endpoints
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const nameFromEmail = email ? email.split('@')[0].replace(/[._-]/g, ' ') : 'Shop Owner';
  const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  const user = {
    id: 'usr_' + Date.now(),
    name: formattedName,
    email: email || 'owner@quantix.shop',
    role: email?.includes('staff') ? 'staff' : 'admin',
    shopName: 'QuantiX Store',
    shopCode: 'QX-101',
  };
  res.json({
    token: 'jwt_quantix_token_' + Date.now(),
    user,
  });
});

app.post('/api/auth/register-shop', (req, res) => {
  const { shopName, ownerName, email } = req.body;
  const user = {
    id: 'usr_' + Date.now(),
    name: ownerName || 'Store Owner',
    email: email || 'owner@quantix.shop',
    role: 'admin',
    shopName: shopName || 'QuantiX Merchant Store',
    shopCode: 'QX-' + Math.floor(100 + Math.random() * 900),
  };
  res.json({
    token: 'jwt_quantix_token_' + Date.now(),
    user,
  });
});

app.post('/api/auth/google', (req, res) => {
  const { email, name, photoURL } = req.body;
  const user = {
    id: 'usr_g_' + Date.now(),
    name: name || (email ? email.split('@')[0] : 'Google Merchant'),
    email: email || 'merchant@quantix.shop',
    role: 'admin',
    shopName: 'QuantiX Store',
    shopCode: 'QX-101',
    avatarUrl: photoURL,
  };
  res.json({
    token: 'jwt_google_token_' + Date.now(),
    user,
  });
});

// 2. Dashboard Analytics
app.get('/api/dashboard', (req, res) => {
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSalesCount = sales.length;
  const lowStockCount = products.filter((p) => p.stock <= p.reorderPoint).length;

  const revenueData = [
    { date: 'Mon', revenue: 420, transactions: 12 },
    { date: 'Tue', revenue: 680, transactions: 18 },
    { date: 'Wed', revenue: 510, transactions: 15 },
    { date: 'Thu', revenue: 890, transactions: 24 },
    { date: 'Fri', revenue: 1120, transactions: 31 },
    { date: 'Sat', revenue: 1450, transactions: 42 },
    { date: 'Sun', revenue: Math.round(totalRevenue), transactions: totalSalesCount },
  ];

  const topProducts = products
    .map((p) => ({
      name: p.name,
      salesCount: Math.floor(15 + Math.random() * 20),
      revenue: Math.round(p.price * p.stock),
      stock: p.stock,
      unit: p.unit,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalSales: totalSalesCount,
    totalProducts: products.length,
    lowStockCount,
    revenueChange: 14.2,
    salesChange: 8.7,
    revenueData,
    topProducts,
    recentTransactions: sales.slice(0, 5),
  });
});

// 3. Products Endpoints
app.get('/api/products', (req, res) => {
  syncStockAlerts();
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const { name, category, price, costPrice, stock, reorderPoint, sku, unit } = req.body;
  const newProd: Product = {
    id: 'prod_' + Date.now(),
    name: name || 'Unnamed Item',
    category: category || 'General',
    price: Number(price) || 0,
    costPrice: Number(costPrice) || 0,
    stock: Number(stock) || 0,
    reorderPoint: Number(reorderPoint) || 5,
    sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    unit: unit || 'item',
  };
  products.unshift(newProd);
  syncStockAlerts();
  res.status(201).json(newProd);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[index] = { ...products[index], ...req.body };
  syncStockAlerts();
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== id);
  res.json({ success: true, id });
});

app.patch('/api/products/bulk', (req, res) => {
  const { ids, action, value } = req.body;
  if (Array.isArray(ids)) {
    products = products.map((p) => {
      if (ids.includes(p.id)) {
        if (action === 'stock_add') {
          return { ...p, stock: p.stock + Number(value || 0) };
        }
        if (action === 'price_adjust_percent') {
          const factor = 1 + Number(value || 0) / 100;
          return { ...p, price: Math.round(p.price * factor * 100) / 100 };
        }
      }
      return p;
    });
  }
  syncStockAlerts();
  res.json({ success: true, updatedCount: ids?.length || 0 });
});

// 4. Sales & Billing Endpoints
app.get('/api/sales', (req, res) => {
  res.json(sales);
});

app.post('/api/sales', (req, res) => {
  const { customerName, customerPhone, items, paymentMethod, discountPercent } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one line item is required' });
  }

  let subtotal = 0;
  const processedItems: SaleItem[] = [];

  items.forEach((item: { productId: string; quantity: number }) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const lineTotal = prod.price * qty;
      subtotal += lineTotal;

      processedItems.push({
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unitPrice: prod.price,
        totalPrice: lineTotal,
      });

      // Decrement stock
      prod.stock = Math.max(0, prod.stock - qty);
    }
  });

  const disc = (subtotal * (Number(discountPercent) || 0)) / 100;
  const taxableAmount = subtotal - disc;
  const tax = taxableAmount * 0.08; // 8% sales tax
  const total = taxableAmount + tax;

  const receiptNo = `REC-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`;

  const newSale: Sale = {
    id: 'sale_' + Date.now(),
    receiptNo,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    items: processedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(disc * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    paymentMethod: paymentMethod || 'cash',
    status: 'PAID',
    timestamp: new Date().toISOString(),
  };

  sales.unshift(newSale);
  syncStockAlerts();

  res.status(201).json(newSale);
});

// 5. Alerts Endpoints
app.get('/api/alerts', (req, res) => {
  syncStockAlerts();
  res.json(alerts);
});

app.post('/api/alerts/read-all', (req, res) => {
  alerts = alerts.map((a) => ({ ...a, read: true }));
  res.json({ success: true });
});

app.delete('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  alerts = alerts.filter((a) => a.id !== id);
  res.json({ success: true, id });
});

// 6. Staff Endpoints
app.get('/api/staff', (req, res) => {
  res.json(staffMembers);
});

app.post('/api/staff', (req, res) => {
  const { name, email, role, phone } = req.body;
  const newStaff: StaffMember = {
    id: 'stf_' + Date.now(),
    name: name || 'New Staff',
    email: email || 'staff@ledger.shop',
    role: role === 'admin' ? 'admin' : 'staff',
    phone: phone || '+1 555-0000',
    status: 'ACTIVE',
    joinedDate: new Date().toISOString().split('T')[0],
  };
  staffMembers.push(newStaff);
  res.status(201).json(newStaff);
});

app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const index = staffMembers.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Staff member not found' });
  }
  staffMembers[index] = { ...staffMembers[index], ...req.body };
  res.json(staffMembers[index]);
});

app.delete('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  staffMembers = staffMembers.filter((s) => s.id !== id);
  res.json({ success: true, id });
});

// 7. AI Assistant Endpoint using @google/genai SDK
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message query is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Intelligent contextual response if API key is not configured in environment
    const lowStockList = products.filter((p) => p.stock <= p.reorderPoint).map((p) => p.name).join(', ');
    const topRevenueItem = products.reduce((prev, curr) => (curr.price * curr.stock > prev.price * prev.stock ? curr : prev), products[0]);

    return res.json({
      reply: `**[Ledger AI Assistant]**\n\nBased on your active shop ledger:\n- **Total Active Inventory**: ${products.length} distinct products.\n- **Low Stock Notice**: ${lowStockList || 'None currently'}.\n- **Top Inventory Valuation**: ${topRevenueItem?.name} ($${topRevenueItem?.price} / ${topRevenueItem?.stock} units).\n\n*Query response:* Regarding "${message}", I recommend reviewing your weekly stock turn rate and placing reorders for items below their threshold before peak weekend hours.`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const inventorySummary = products.map((p) => `${p.name} (Stock: ${p.stock}, Price: $${p.price}, Category: ${p.category})`).join('; ');
    const recentSalesTotal = sales.reduce((acc, s) => acc + s.total, 0);

    const systemPrompt = `You are QuantiX AI, an expert shop management, inventory auditor, and retail financial assistant.
Context of the store:
- Current Inventory: ${inventorySummary}
- Recent Sales Revenue: $${recentSalesTotal.toFixed(2)}
- Total Register Transactions: ${sales.length}

User prompt: "${message}"

Provide a concise, highly practical, formatted Markdown response tailored to retail shop owners. Use bullet points and clear numbers where helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
    });

    const reply = response.text || 'I analyzed your ledger request. Everything appears on track.';
    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.json({
      reply: `**[Ledger AI Assistant]**\n\nI processed your request regarding "${message}". Based on current stock records, you have ${products.length} product lines active. Please verify low stock alerts under the Alerts ledger tab.`,
    });
  }
});

// Vite Middleware for Dev or Static Serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuantiX Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
