export const CURRENCIES = ['USD', 'PEN'] as const;

export type Currency = (typeof CURRENCIES)[number];
