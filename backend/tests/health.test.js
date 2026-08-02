process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const { sequelize } = require('../src/models');
const app = require('../src/server');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // fresh in-memory DB for this run
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('auth flow', () => {
  const shop = {
    shopName: 'Test Shop',
    email: 'owner@test-shop.example',
    password: 'password123',
  };

  it('registers a new shop and returns a token', async () => {
    const res = await request(app).post('/api/auth/register-shop').send(shop);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('admin');
  });

  it('rejects a duplicate shop email', async () => {
    const res = await request(app).post('/api/auth/register-shop').send(shop);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: shop.email, password: shop.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects an invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: shop.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated access to protected routes', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
  });
});
