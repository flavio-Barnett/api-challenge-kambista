export const LOGIN_ATTEMPTS_POLICY = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
} as const;
