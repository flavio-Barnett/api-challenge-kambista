import type { AppConfig } from '../../../../shared/infrastructure/config/app-config.js';
import { ExchangeRateProviderError } from '../../application/exchange-rates.errors.js';
import { InvalidExchangeRateError } from '../../domain/exchange-rates.errors.js';
import { SunatExchangeRateProviderAdapter } from './sunat-exchange-rate-provider.adapter.js';

const config = {
  exchangeRateProviderUrl: 'https://provider.test/tipo-cambio',
} as AppConfig;

const validBody = {
  origen: 'SUNAT',
  compra: 3.408,
  venta: 3.419,
  moneda: 'USD',
  fecha: '2026-11-17',
};

function respondWith(body: string, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(body, { status })),
  );
}

function respondWithJson(body: unknown, status = 200): void {
  respondWith(JSON.stringify(body), status);
}

describe('SunatExchangeRateProviderAdapter', () => {
  const provider = new SunatExchangeRateProviderAdapter(config);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('maps a valid response to an exact quote', async () => {
    respondWithJson(validBody);

    const quote = await provider.fetchQuote();

    expect(quote.buy.toString()).toBe('3.408');
    expect(quote.sell.toString()).toBe('3.419');
    expect(quote.providerDate).toBe('2026-11-17');
  });

  it('requests the configured url with a three second timeout', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    respondWithJson(validBody);

    await provider.fetchQuote();

    expect(timeout).toHaveBeenCalledWith(3000);
    expect(fetch).toHaveBeenCalledWith(config.exchangeRateProviderUrl, {
      signal: timeout.mock.results[0]?.value as AbortSignal,
    });
  });

  it.each([
    ['missing fields', { compra: 3.408 }],
    ['text instead of numbers', { ...validBody, compra: 'x', venta: 'y' }],
    ['another currency', { ...validBody, moneda: 'EUR' }],
  ])('rejects a response with %s', async (_case, body) => {
    respondWithJson(body);

    await expect(provider.fetchQuote()).rejects.toBeInstanceOf(
      ExchangeRateProviderError,
    );
  });

  it('rejects a body that is not json', async () => {
    respondWith('<html>maintenance</html>');

    await expect(provider.fetchQuote()).rejects.toMatchObject({
      reason: 'invalid json',
    });
  });

  it('rejects inconsistent rates', async () => {
    respondWithJson({ ...validBody, compra: 3.5 });

    await expect(provider.fetchQuote()).rejects.toBeInstanceOf(
      InvalidExchangeRateError,
    );
  });

  it('reports an unsuccessful status', async () => {
    respondWithJson({}, 500);

    await expect(provider.fetchQuote()).rejects.toMatchObject({
      reason: 'status 500',
    });
  });

  it('reports a timeout', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValue(
          new DOMException('The operation timed out', 'TimeoutError'),
        ),
    );

    await expect(provider.fetchQuote()).rejects.toMatchObject({
      reason: 'TimeoutError',
    });
  });
});
