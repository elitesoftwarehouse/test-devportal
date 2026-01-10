export class HttpError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(status: number, code: string, details?: any) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends HttpError {
  constructor(code: string, details?: any) {
    super(400, code, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends HttpError {
  constructor(code: string, details?: any) {
    super(404, code, details);
    this.name = 'NotFoundError';
  }
}
