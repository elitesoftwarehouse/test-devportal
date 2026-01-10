export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  private constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: any): ApiError {
    return new ApiError(400, message, details);
  }

  static forbidden(message: string, details?: any): ApiError {
    return new ApiError(403, message, details);
  }

  static internal(message: string, details?: any): ApiError {
    return new ApiError(500, message, details);
  }
}
