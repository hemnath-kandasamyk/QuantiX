const express = require('express');
const { Op, col, where: sequelizeWhere } = require('sequelize');
const { Product, Inventory } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/alerts?expiryWindowDays=15
// Returns products that are low on stock or nearing expiry, for the
// in-app pop-up notification.
router.get('/', async (req, res) => {
  const expiryWindowDays = Number(req.query.expiryWindowDays || 15);

  const products = await Product.findAll({
    where: { retailerId: req.user.retailerId, isActive: true },
    include: [{ model: Inventory }],
  });

  const today = new Date();
  const windowEnd = new Date();
  windowEnd.setDate(today.getDate() + expiryWindowDays);

  const lowStock = [];
  const expiringSoon = [];
  const outOfStock = [];

  for (const p of products) {
    const qty = p.Inventory ? p.Inventory.currentQuantity : 0;
    if (qty === 0) {
      outOfStock.push({ id: p.id, name: p.name, rackLocation: p.rackLocation, currentQuantity: qty });
    } else if (qty <= p.lowStockThreshold) {
      lowStock.push({ id: p.id, name: p.name, rackLocation: p.rackLocation, currentQuantity: qty, threshold: p.lowStockThreshold });
    }
    if (p.expiryDate) {
      const expiry = new Date(p.expiryDate);
      if (expiry <= windowEnd) {
        expiringSoon.push({
          id: p.id, name: p.name, rackLocation: p.rackLocation,
          expiryDate: p.expiryDate,
          daysLeft: Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)),
        });
      }
    }
  }

  expiringSoon.sort((a, b) => a.daysLeft - b.daysLeft);

  res.json({
    outOfStock,
    lowStock,
    expiringSoon,
    totalAlerts: outOfStock.length + lowStock.length + expiringSoon.length,
  });
});

// POST /api/alerts/read-all
// NOTE: alerts here are computed on the fly from live product/inventory
// data (see GET / above) — there's no Alert table to mark as "read".
// This route exists so the frontend's "mark all read" button has a real
// endpoint to call instead of 404ing. If you want alerts to actually stay
// dismissed across page loads/devices, you'd add an AlertRead model
// (retailerId, productId, alertType, readAt) and check against it in GET /.
router.post('/read-all', async (req, res) => {
  res.json({ success: true });
});

// DELETE /api/alerts/:id
// Same caveat as above: since alerts aren't persisted rows, this can't
// really "delete" one. It just acknowledges the dismissal so the frontend
// can remove it from the current view. It will reappear on next refresh
// until the AlertRead-style tracking described above is built.
router.delete('/:id', async (req, res) => {
  res.json({ success: true, id: req.params.id });
});

module.exports = router;
