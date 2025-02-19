const request = require('supertest');
const app = require('../index'); // Assuming your Express app is exported from index.js
const User = require('../models/userModel');

describe('User Routes', () => {
  beforeAll(async () => {
    await User.deleteMany(); // Clear the database before tests
  });

  afterAll(async () => {
    await User.deleteMany(); // Clear the database after tests
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
        },
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not register a user with existing email', async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
        },
      });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Another User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '0987654321',
        address: {
          street: '456 Another St',
          city: 'Another City',
          state: 'Another State',
          zipCode: '54321',
        },
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('User already exists');
  });
});
