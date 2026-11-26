import { describe, expect, it } from 'vitest';
import { apiBaseUrl, describeHealth, fetchHealth } from '../src/health.js';

describe('health helpers', () => {
  it('strips trailing slashes from the API URL', () => {
    expect(apiBaseUrl('https://api.example.test/')).toBe('https://api.example.test');
  });

  it('calls /health on the configured API and returns the body', async () => {
    const fakeFetch = async (url) => {
      expect(url).toBe('https://api.example.test/health');
      return { status: 200, json: async () => ({ status: 'ok', db: 'ok' }) };
    };
    const result = await fetchHealth(fakeFetch, 'https://api.example.test');
    expect(describeHealth(result)).toEqual({ tone: 'good', label: 'API and database OK' });
  });

  it('reports a database outage', () => {
    expect(describeHealth({ httpStatus: 503, status: 'error', db: 'unreachable' }).tone).toBe('bad');
  });
});
