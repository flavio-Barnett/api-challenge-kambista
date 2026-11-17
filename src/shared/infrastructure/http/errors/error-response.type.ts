export interface ErrorBody {
  readonly code: string;
  readonly message: string;
}

export interface ErrorResponse {
  readonly success: false;
  readonly error: ErrorBody;
}

export interface ResolvedError extends ErrorBody {
  readonly status: number;
}
