const request = require('supertest');
const app = require('../src/app');

describe('GET /contracts/:id', () => {
  it('should return the contract by id', async () => {
    const response = await request(app)
      .get('/contracts/1')
      .set('profile_id', 1);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
  });

  it('should return 404 if contract not found', async () => {
    const response = await request(app)
      .get('/contracts/999')
      .set('profile_id', 1);
    expect(response.status).toBe(404);
  });

  it('should return 403 if contract does not belong to the profile', async () => {
    const response = await request(app)
      .get('/contracts/1')
      .set('profile_id', 3);
    expect(response.status).toBe(403);
  });
});

describe('GET /contracts', () => {
  it('should return a list of contracts belonging to a user', async () => {
    const response = await request(app)
      .get('/contracts')
      .set('profile_id', 1);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});

describe('GET /jobs/unpaid', () => {
  it('should return a list of unpaid jobs for a user', async () => {
    const response = await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', 1);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});

describe('POST /jobs/:job_id/pay', () => {
  it('should pay for a job', async () => {
    const response = await request(app)
      .post('/jobs/2/pay')
      .set('profile_id', 1)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Payment successful');
  });

  it('should return 400 if job is already paid', async () => {
    const response = await request(app)
      .post('/jobs/2/pay')
      .set('profile_id', 1)
      .send();
    expect(response.status).toBe(400);
  });

  it('should return 403 if client does not match', async () => {
    const response = await request(app)
      .post('/jobs/3/pay')
      .set('profile_id', 3)
      .send();
    expect(response.status).toBe(403);
  });

  it('should return 400 if insufficient balance', async () => {
    const response = await request(app)
      .post('/jobs/5/pay')
      .set('profile_id', 4)
      .send();
    expect(response.status).toBe(400);
  });
});

describe('POST /balances/deposit/:userId', () => {
  it('should deposit money into a client\'s balance', async () => {
    const response = await request(app)
      .post('/balances/deposit/4')
      .set('profile_id', 2)
      .send({ amount: 1 });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Deposit successful');
  });

  it('should return 403 if profile is not a client', async () => {
    const response = await request(app)
      .post('/balances/deposit/5')
      .set('profile_id', 5)
      .send({ amount: 100 });
    expect(response.status).toBe(403);
  });

  it('should return 400 if deposit exceeds 25% of total unpaid jobs', async () => {
    const response = await request(app)
      .post('/balances/deposit/1')
      .set('profile_id', 1)
      .send({ amount: 1000 });
    expect(response.status).toBe(400);
  });
});

describe('GET /admin/best-profession', () => {
  it('should return the profession that earned the most money', async () => {
    const response = await request(app)
      .get('/admin/best-profession')
      .query({ start: '2020-01-01', end: '2020-12-31' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('profession');
  });
});

describe('GET /admin/best-clients', () => {
  it('should return the clients who paid the most for jobs', async () => {
    const response = await request(app)
      .get('/admin/best-clients')
      .query({ start: '2020-01-01', end: '2020-12-31', limit: 2 });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});
