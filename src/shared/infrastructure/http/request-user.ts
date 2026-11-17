export interface RequestUser {
  readonly id: string;
}

export function requestUserId(request: object): string | undefined {
  if (!('user' in request)) {
    return undefined;
  }
  const { user } = request;
  if (typeof user !== 'object' || user === null || !('id' in user)) {
    return undefined;
  }
  return typeof user.id === 'string' ? user.id : undefined;
}
