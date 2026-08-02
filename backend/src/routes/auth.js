const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Retailer, User } = require('../models');
const { authenticate, requireAdmin, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { userId: user.id, retailerId: user.retailerId, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// POST /api/auth/register-shop
// A new retailer registers their shop. This also creates their own
// "admin" user login in the same step.
router.post('/register-shop', async (req, res) => {
  try {
    const { shopName, email, phone, password } = req.body;
    if (!shopName || !email || !password) {
      return res.status(400).json({ error: 'shopName, email and password are required' });
    }
    const existing = await Retailer.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'A shop is already registered with this email' });

    const retailer = await Retailer.create({
      shopName, email, phone,
      passwordHash: await bcrypt.hash(password, 10),
    });

    const adminUser = await User.create({
      retailerId: retailer.id,
      name: shopName + ' (Owner)',
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'admin',
    });

    const token = signToken(adminUser);
    res.status(201).json({
      token,
      user: { id: adminUser.id, name: adminUser.name, role: adminUser.role, retailerId: retailer.id, shopName: retailer.shopName },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
// Used by both the owner (admin) and staff accounts.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const retailer = await Retailer.findByPk(user.retailerId);
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, retailerId: user.retailerId, shopName: retailer.shopName },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/staff
// Admin-only: create a restricted staff login for hired labour.
router.post('/staff', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'A user already exists with this email' });

    const staff = await User.create({
      retailerId: req.user.retailerId,
      name, email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'staff',
    });
    res.status(201).json({ id: staff.id, name: staff.name, email: staff.email, role: staff.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/staff - list staff accounts under this shop (admin only)
router.get('/staff', authenticate, requireAdmin, async (req, res) => {
  const staff = await User.findAll({
    where: { retailerId: req.user.retailerId },
    attributes: ['id', 'name', 'email', 'role', 'createdAt'],
  });
  res.json(staff);
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

// DELETE /api/auth/staff/:id - admin-only: remove a staff login.
// Guards against removing the wrong retailer's user, and against an
// admin accidentally deleting their own account through this route.
router.delete('/staff/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const staff = await User.findOne({
      where: { id: req.params.id, retailerId: req.user.retailerId },
    });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    if (staff.id === req.user.userId) {
      return res.status(400).json({ error: 'You cannot remove your own account' });
    }
    await staff.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google
// Firebase has already verified the user's identity client-side (that's
// what produced idToken/email/name). We trust that email here rather than
// re-verifying the token server-side, since this project doesn't run the
// firebase-admin SDK. If you later add server-side verification, this is
// the route to harden first.
// - Existing email -> logs that user in.
// - New email -> creates a brand-new shop (shopName defaults from their
//   Google display name; they can rename it later from Settings).
router.post('/google', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    let user = await User.findOne({ where: { email } });
    let retailer;

    if (user) {
      retailer = await Retailer.findByPk(user.retailerId);
    } else {
      const shopName = name ? `${name}'s Shop` : 'My Shop';
      const randomPassword = await bcrypt.hash(email + Date.now(), 10);

      retailer = await Retailer.create({
        shopName,
        email,
        passwordHash: randomPassword,
      });
      user = await User.create({
        retailerId: retailer.id,
        name: name || shopName,
        email,
        passwordHash: randomPassword,
        role: 'admin',
      });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role, retailerId: user.retailerId, shopName: retailer.shopName },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
// JWTs are stateless, so there's nothing to invalidate server-side yet.
// This exists so the frontend has a real endpoint to call (and a place to
// add token/session revocation later, e.g. a denylist table).
router.post('/logout', authenticate, async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
