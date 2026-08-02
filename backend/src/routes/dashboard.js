const express = require('express');
const { Op } = require('sequelize');
const { Sale, SaleItem, Product } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function startOfYear(d) { return new Date(d.getFullYear(), 0, 1); }

async function salesSince(retailerId, since) {
  return Sale.findAll({
    where: { retailerId, createdAt: { [Op.gte]: since } },
    include: [{ model: SaleItem, as: 'items', include: [Product] }],
  });
}

function summarize(sales) {
  let revenue = 0, profit = 0, transactions = sales.length, unitsSold = 0;
  const productTotals = {};

  for (const sale of sales) {
    revenue += sale.totalAmount;
    for (const item of sale.items) {
      unitsSold += item.quantitySold;
      const itemRevenue = item.priceAtSale * item.quantitySold;
      const itemCost = item.costAtSale * item.quantitySold;
      profit += (itemRevenue - itemCost);

      const name = item.Product ? item.Product.name : `Product #${item.productId}`;
      if (!productTotals[name]) productTotals[name] = { name, unitsSold: 0, revenue: 0 };
      productTotals[name].unitsSold += item.quantitySold;
      productTotals[name].revenue += itemRevenue;
    }
  }

  const topProducts = Object.values(productTotals).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  return { revenue: round2(revenue), profit: round2(profit), transactions, unitsSold, topProducts };
}

function round2(n) { return Math.round(n * 100) / 100; }

// GET /api/dashboard  (root)
// The frontend's Dashboard page expects one combined payload rather than
// calling /summary, /trend, /staff-performance separately. This assembles
// that shape from the same data those routes use.
//
// NOTE on approximated fields: the Sale/Product models don't currently
// store receiptNo, customerName, paymentMethod, sku, or unit — those
// columns don't exist yet. Below they're filled with reasonable
// placeholders (e.g. paymentMethod falls back to the real `paymentMode`
// field, receiptNo is synthesized from the sale id). If you want these to
// be real, add the columns to the Sale/Product models + a migration.
router.get('/', async (req, res) => {
  const retailerId = req.user.retailerId;
  const now = new Date();
  const since30 = new Date();
  since30.setDate(now.getDate() - 29);
  since30.setHours(0, 0, 0, 0);

  const [monthSales, thirtyDaySales, products] = await Promise.all([
    salesSince(retailerId, startOfMonth(now)),
    salesSince(retailerId, since30),
    Product.findAll({ where: { retailerId, isActive: true }, include: [{ model: Inventory }] }),
  ]);

  const monthSummary = summarize(monthSales);

  // Previous month, for the "change" percentages.
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = startOfMonth(now);
  const prevMonthSales = await Sale.findAll({
    where: { retailerId, createdAt: { [Op.gte]: prevMonthStart, [Op.lt]: prevMonthEnd } },
    include: [{ model: SaleItem, as: 'items', include: [Product] }],
  });
  const prevSummary = summarize(prevMonthSales);
  const pctChange = (curr, prev) => (prev === 0 ? (curr > 0 ? 100 : 0) : round2(((curr - prev) / prev) * 100));

  // Revenue series for the last 30 days.
  const byDay = {};
  for (const sale of thirtyDaySales) {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = { revenue: 0, transactions: 0 };
    byDay[key].revenue += sale.totalAmount;
    byDay[key].transactions += 1;
  }
  const revenueData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    revenueData.push({
      date: key,
      revenue: round2(byDay[key]?.revenue || 0),
      transactions: byDay[key]?.transactions || 0,
    });
  }

  const lowStockCount = products.filter((p) => {
    const qty = p.Inventory ? p.Inventory.currentQuantity : 0;
    return qty <= p.lowStockThreshold;
  }).length;

  const topProducts = monthSummary.topProducts.map((tp) => {
    const product = products.find((p) => p.name === tp.name);
    return {
      name: tp.name,
      salesCount: tp.unitsSold,
      revenue: tp.revenue,
      stock: product?.Inventory ? product.Inventory.currentQuantity : 0,
      unit: 'pcs', // placeholder — no unit column on Product yet
    };
  });

  const recentSalesRaw = [...monthSales]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  const recentTransactions = recentSalesRaw.map((sale) => ({
    id: String(sale.id),
    receiptNo: `INV-${String(sale.id).padStart(5, '0')}`, // placeholder — no receiptNo column yet
    customerName: 'Walk-in Customer', // placeholder — no customerName column yet
    total: round2(sale.totalAmount),
    paymentMethod: sale.paymentMode,
    timestamp: sale.createdAt,
    items: sale.items.map((i) => ({
      productName: i.Product ? i.Product.name : `Product #${i.productId}`,
      quantity: i.quantitySold,
    })),
  }));

  res.json({
    totalRevenue: monthSummary.revenue,
    totalSales: monthSummary.transactions,
    totalProducts: products.length,
    lowStockCount,
    revenueChange: pctChange(monthSummary.revenue, prevSummary.revenue),
    salesChange: pctChange(monthSummary.transactions, prevSummary.transactions),
    revenueData,
    topProducts,
    recentTransactions,
  });
});

// GET /api/dashboard/summary
// Returns today / this month / this year rollups plus top products.
router.get('/summary', async (req, res) => {
  const now = new Date();
  const retailerId = req.user.retailerId;

  const [todaySales, monthSales, yearSales] = await Promise.all([
    salesSince(retailerId, startOfDay(now)),
    salesSince(retailerId, startOfMonth(now)),
    salesSince(retailerId, startOfYear(now)),
  ]);

  res.json({
    today: summarize(todaySales),
    thisMonth: summarize(monthSales),
    thisYear: summarize(yearSales),
  });
});

// GET /api/dashboard/trend?range=30 (days)
// Daily revenue series for charting.
router.get('/trend', async (req, res) => {
  const days = Number(req.query.range || 30);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const sales = await salesSince(req.user.retailerId, since);
  const byDay = {};
  for (const sale of sales) {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + sale.totalAmount;
  }

  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, revenue: round2(byDay[key] || 0) });
  }
  res.json(series);
});

// GET /api/dashboard/staff-performance
// Sales totals grouped by staff member (accountability view).
router.get('/staff-performance', async (req, res) => {
  const { User } = require('../models');
  const sales = await Sale.findAll({
    where: { retailerId: req.user.retailerId },
    include: [{ model: SaleItem, as: 'items' }, { model: User, attributes: ['id', 'name', 'role'] }],
  });

  const byStaff = {};
  for (const sale of sales) {
    const key = sale.User ? sale.User.name : `User #${sale.userId}`;
    if (!byStaff[key]) byStaff[key] = { staff: key, transactions: 0, revenue: 0, unitsSold: 0 };
    byStaff[key].transactions += 1;
    byStaff[key].revenue += sale.totalAmount;
    byStaff[key].unitsSold += sale.items.reduce((s, i) => s + i.quantitySold, 0);
  }
  res.json(Object.values(byStaff).map(s => ({ ...s, revenue: round2(s.revenue) })));
});

module.exports = router;
