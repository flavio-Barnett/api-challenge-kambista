export class ErrorBodyDto {
  code: string;
  message: string;
}

export class ErrorResponseDto {
  success: boolean;
  error: ErrorBodyDto;
}
