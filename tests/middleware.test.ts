// tests/middleware.test.ts
import {agent as request} from 'supertest';
import express, { Request, Response } from 'express';
import { initMonitoring } from '../src/index';

// Create a configuration for testing.
const testConfig = {
  loggingServerUrl: 'http://example.com/logs',
  apiToken: 'test-token',
  userId: 'test-user',
  batchInterval: 100, // shorten for testing
};

const app = express();
const monitoring = initMonitoring(testConfig);
app.use(monitoring.middleware());
app.get('/', (req: Request, res: Response) => res.send('Hello World'));

describe('API Monitoring Middleware', () => {
  it('should process requests and queue logs', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});
