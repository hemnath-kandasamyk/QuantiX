/**
 * Seed script - populates the local SQLite DB with a demo shop so you can
 * log in and click around immediately instead of starting from an empty
 * database.
 *
 * Usage:
 *   npm run seed        (from backend/)
 *
 * Safe to re-run: it checks for the demo retailer by email before creating
 * anything, so it won't create duplicate rows on a second run.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  Retailer,
  User,
  Product,
  Inventory,
  Sale,
  SaleItem,
} = require('../models');

const DEMO_EMAIL = 'owner@demo-shop.test';
const DEMO_PASSWORD = 'password123';

const DEMO_PRODUCTS = [
  { name: 'Organic Colombian Coffee Beans (1kg)', category: 'Beverages', costPrice: 16.0, sellingPrice: 28.5, stock: 45, lowStockThreshold: 15 },
  { name: 'Artisan Sourdough Loaf', category: 'Bakery', costPrice: 2.2, sellingPrice: 6.5, stock: 8, lowStockThreshold: 10 },
  { name: 'Matcha Green Tea Powder (250g)', category: 'Beverages', costPrice: 12.0, sellingPrice: 22.0, stock: 3, lowStockThreshold: 8 },
  { name: 'Raw Honey Jar (500ml)', category: 'Pantry', costPrice: 7.5, sellingPrice: 14.0, stock: 24, lowStockThreshold: 10 },
  { name: 'Oat Milk Barista Edition (1L)', category: 'Dairy/Alt', costPrice: 2.5, sellingPrice: 4.8, stock: 62, lowStockThreshold: 20 },
  { name: 'Almond Croissant', category: 'Bakery', costPrice: 1.5, sellingPrice: 4.2, stock: 5, lowStockThreshold: 12 },
  { name: 'Dark Chocolate 85% (100g)', category: 'Snacks', costPrice: 2.8, sellingPrice: 5.5, stock: 30, lowStockThreshold: 10 },
];

async function seed() {
  await sequelize.sync();

  let retailer = await Retailer.findOne({ where: { email: DEMO_EMAIL } });
  if (retailer) {
    console.log(`Demo retailer already exists (${DEMO_EMAIL}). Skipping seed.`);
    console.log(`Log in with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
    await sequelize.close();
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  retailer = await Retailer.create({
    shopName: 'Demo Corner Store',
    email: DEMO_EMAIL,
    phone: '+91 90000 00000',
    passwordHash,
  });

  const admin = await User.create({
    retailerId: retailer.id,
    name: 'Demo Corner Store (Owner)',
    email: DEMO_EMAIL,
    passwordHash,
    role: 'admin',
  });

  const staff = await User.create({
    retailerId: retailer.id,
    name: 'Staff Member',
    email: 'staff@demo-shop.test',
    passwordHash: await bcrypt.hash('password123', 10),
    role: 'staff',
  });

  const createdProducts = [];
  for (const p of DEMO_PRODUCTS) {
    const product = await Product.create({
      retailerId: retailer.id,
      name: p.name,
      category: p.category,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      lowStockThreshold: p.lowStockThreshold,
    });
    await Inventory.create({ productId: product.id, currentQuantity: p.stock });
    createdProducts.push(product);
  }

  // A couple of demo sales so the dashboard/sales history isn't empty.
  const sale = await Sale.create({
    retailerId: retailer.id,
    userId: admin.id,
    paymentMode: 'cash',
    totalAmount: 0,
  });

  let total = 0;
  const lines = [
    { product: createdProducts[0], qty: 2 },
    { product: createdProducts[4], qty: 3 },
  ];
  for (const line of lines) {
    const lineTotal = line.product.sellingPrice * line.qty;
    total += lineTotal;
    await SaleItem.create({
      saleId: sale.id,
      productId: line.product.id,
      quantitySold: line.qty,
      priceAtSale: line.product.sellingPrice,
      costAtSale: line.product.costPrice,
    });
  }
  sale.totalAmount = Math.round(total * 100) / 100;
  await sale.save();

  console.log('Seed complete.');
  console.log(`Shop: ${retailer.shopName}`);
  console.log(`Admin login:  ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Staff login:  ${staff.email} / password123`);
  await sequelize.close();
}

seed().catch(async (err) => {
  console.error('Seed failed:', err);
  await sequelize.close();
  process.exit(1);
});
