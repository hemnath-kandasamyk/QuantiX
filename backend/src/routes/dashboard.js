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
