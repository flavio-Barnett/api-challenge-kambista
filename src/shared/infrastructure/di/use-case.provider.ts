import type { FactoryProvider } from '@nestjs/common';

type Token<T> = abstract new (...args: never) => T;

export function useCase<T, Deps extends unknown[]>(
  useCaseClass: new (...deps: Deps) => T,
  dependencies: { [K in keyof Deps]: Token<Deps[K]> },
): FactoryProvider<T> {
  return {
    provide: useCaseClass,
    inject: [...dependencies],
    useFactory: (...deps: Deps) => new useCaseClass(...deps),
  };
}
