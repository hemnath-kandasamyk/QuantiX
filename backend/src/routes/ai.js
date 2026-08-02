const express = require('express');
const { Op } = require('sequelize');
const { Sale, SaleItem, Product, Inventory } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function round2(n) { return Math.round(n * 100) / 100; }

async function getContext(retailerId) {
  const now = new Date();
  const [todaySales, monthSales, products] = await Promise.all([
    Sale.findAll({ where: { retailerId, createdAt: { [Op.gte]: startOfDay(now) } }, include: [{ model: SaleItem, as: 'items', include: [Product] }] }),
    Sale.findAll({ where: { retailerId, createdAt: { [Op.gte]: startOfMonth(now) } }, include: [{ model: SaleItem, as: 'items', include: [Product] }] }),
    Product.findAll({ where: { retailerId, isActive: true }, include: [{ model: Inventory }] }),
  ]);
  return { todaySales, monthSales, products };
}

function aggregate(sales) {
  let revenue = 0, profit = 0;
  const byProduct = {};
  for (const sale of sales) {
    revenue += sale.totalAmount;
    for (const item of sale.items) {
      const rev = item.priceAtSale * item.quantitySold;
      const cost = item.costAtSale * item.quantitySold;
      profit += rev - cost;
      const name = item.Product ? item.Product.name : `#${item.productId}`;
      byProduct[name] = (byProduct[name] || 0) + item.quantitySold;
    }
  }
  const ranked = Object.entries(byProduct).sort((a, b) => b[1] - a[1]);
  return { revenue: round2(revenue), profit: round2(profit), ranked };
}

// Lightweight rule-based NLU. This covers common shopkeeper questions
// without needing an external API key. If OPENAI_API_KEY / GEMINI_API_KEY
// is set in .env, swap this for a real LLM call (see README) — the same
// `context` payload built below is what you'd pass as grounding data.
function answerLocally(question, context) {
  const q = question.toLowerCase();
  const today = aggregate(context.todaySales);
  const month = aggregate(context.monthSales);

  if (/today.*sale|sale.*today/.test(q)) {
    return `Today's sales: ₹${today.revenue} in revenue across ${context.todaySales.length} transaction(s), with an estimated profit of ₹${today.profit}.`;
  }
  if (/(this month|monthly).*(sale|revenue)|sale.*month/.test(q)) {
    return `This month so far: ₹${month.revenue} in revenue across ${context.monthSales.length} transaction(s), estimated profit ₹${month.profit}.`;
  }
  if (/profit/.test(q) && /today/.test(q)) {
    return `Estimated profit today is ₹${today.profit} (revenue ₹${today.revenue}).`;
  }
  if (/profit/.test(q)) {
    return `Estimated profit this month is ₹${month.profit} (revenue ₹${month.revenue}).`;
  }
  if (/(highest|best|top|most).*(sell|sale|selling)/.test(q) || /which product.*sell/.test(q)) {
    if (month.ranked.length === 0) return `No sales recorded yet this month.`;
    const [name, units] = month.ranked[0];
    return `"${name}" is your top seller this month with ${units} unit(s) sold.`;
  }
  if (/low stock|running (out|low)|reorder/.test(q)) {
    const low = context.products.filter(p => (p.Inventory?.currentQuantity ?? 0) <= p.lowStockThreshold);
    if (low.length === 0) return `No products are currently low on stock. You're in good shape.`;
    const list = low.slice(0, 5).map(p => `${p.name} (${p.Inventory.currentQuantity} left)`).join(', ');
    return `${low.length} product(s) are low on stock: ${list}${low.length > 5 ? ', and more' : ''}.`;
  }
  if (/expir/.test(q)) {
    const soon = context.products.filter(p => p.expiryDate && new Date(p.expiryDate) <= new Date(Date.now() + 15 * 86400000));
    if (soon.length === 0) return `No products are nearing expiry in the next 15 days.`;
    const list = soon.slice(0, 5).map(p => `${p.name} (expires ${p.expiryDate})`).join(', ');
    return `${soon.length} product(s) are nearing expiry: ${list}.`;
  }
  if (/how many product|catalog size|total product/.test(q)) {
    return `You currently have ${context.products.length} active product(s) in your catalog.`;
  }

  return `I can answer questions like "What were today's sales?", "Which product sold the most this month?", "What's my profit this month?", "What's running low on stock?", or "What's nearing expiry?". Try rephrasing your question along those lines.`;
}

// Builds a compact, numbers-only summary of the retailer's real data to
// ground the LLM's answer — this is what stops Grok from making up figures,
// and keeps it scoped strictly to this retailer's own shop.
function buildDataSummary(context) {
  const today = aggregate(context.todaySales);
  const month = aggregate(context.monthSales);
  const lowStock = context.products.filter(p => (p.Inventory?.currentQuantity ?? 0) <= p.lowStockThreshold);
  const expiringSoon = context.products.filter(
    p => p.expiryDate && new Date(p.expiryDate) <= new Date(Date.now() + 15 * 86400000)
  );

  // Cap the full product listing so the prompt stays small for shops with
  // huge catalogs — beyond this, point the user to the Products page instead.
  const PRODUCT_LIST_LIMIT = 100;
  const fullProductList = context.products
    .slice(0, PRODUCT_LIST_LIMIT)
    .map(p => `${p.name} (qty: ${p.Inventory?.currentQuantity ?? 0}, rack: ${p.rackLocation || 'unassigned'}, price: ₹${p.sellingPrice})`)
    .join('; ');
  const truncatedNote = context.products.length > PRODUCT_LIST_LIMIT
    ? ` ...and ${context.products.length - PRODUCT_LIST_LIMIT} more (too many to list here — direct the user to the Products page for the full catalog).`
    : '';

  return `TODAY: revenue ₹${today.revenue}, profit ₹${today.profit}, transactions ${context.todaySales.length}
THIS MONTH: revenue ₹${month.revenue}, profit ₹${month.profit}, transactions ${context.monthSales.length}
TOP SELLERS THIS MONTH (product: units sold): ${month.ranked.slice(0, 10).map(([n, u]) => `${n}: ${u}`).join(', ') || 'none yet'}
TOTAL ACTIVE PRODUCTS: ${context.products.length}
FULL PRODUCT LIST (name, qty, rack, price): ${fullProductList || 'none'}${truncatedNote}
LOW STOCK (name: qty left): ${lowStock.map(p => `${p.name}: ${p.Inventory?.currentQuantity ?? 0}`).join(', ') || 'none'}
EXPIRING WITHIN 15 DAYS (name: date): ${expiringSoon.map(p => `${p.name}: ${p.expiryDate}`).join(', ') || 'none'}`;
}

// Calls xAI's Grok API (OpenAI-compatible /chat/completions endpoint).
// Returns null on any failure so the route can fall back to answerLocally.
async function callGrok(question, context) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const dataSummary = buildDataSummary(context);
  const systemPrompt = `You are a business assistant for a small retail shop owner, built into their inventory
and billing app. Answer ONLY using the shop data provided below — never invent numbers.
If the data doesn't cover what's asked, say so plainly. Keep answers short (2-4 sentences),
practical, and in plain language a shopkeeper would use. Currency is INR (₹).

SHOP DATA:
${dataSummary}`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || 'grok-4.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('Grok API call failed:', err.message);
    return null;
  }
}

// Calls Google's Gemini API (generateContent endpoint).
// Returns null on any failure so the route can fall back to answerLocally.
async function callGemini(question, context) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const dataSummary = buildDataSummary(context);
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = `You are a business assistant for a small retail shop owner, built into their inventory
and billing app. Answer ONLY using the shop data provided below — never invent numbers.
If the data doesn't cover what's asked, say so plainly. Keep answers short (2-4 sentences),
practical, and in plain language a shopkeeper would use. Currency is INR (₹).

SHOP DATA:
${dataSummary}

QUESTION: ${question}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
            thinkingConfig: { thinkingBudget: 0 }, // flash: skip internal reasoning, so the token budget goes to the visible answer
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return null;
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.error('Gemini API call failed:', err.message);
    return null;
  }
}

// POST /api/ai/ask   Body: { question: string }
// Tries Grok first (if XAI_API_KEY set), then Gemini (if GEMINI_API_KEY set),
// then falls back to the local rule-based engine.
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const context = await getContext(req.user.retailerId);

    let answer = await callGrok(question, context);
    let source = 'grok';
    if (!answer) {
      answer = await callGemini(question, context);
      source = 'gemini';
    }
    if (!answer) {
      answer = answerLocally(question, context);
      source = 'local';
    }

    res.json({ question, answer, source });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;