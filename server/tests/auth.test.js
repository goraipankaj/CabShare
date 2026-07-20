const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Health check', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth flow', () => {
  const passenger = {
    name: 'Test Passenger',
    email: 'test.passenger@example.com',
    phone: '+919812345678',
    password: 'Passw0rd!',
  };

  it('registers a new passenger', async () => {
    const res = await request(app).post('/api/auth/register').send(passenger);
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe(passenger.email);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').send(passenger);
    expect(res.statusCode).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: passenger.email, password: passenger.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: passenger.email, password: 'WrongPass1' });
    expect(res.statusCode).toBe(401);
  });
});
