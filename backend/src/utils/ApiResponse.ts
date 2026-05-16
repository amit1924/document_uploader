export class ApiResponse<T = unknown> {
  public success: boolean;
  public message: string;
  public data?: T;
  public meta?: Record<string, unknown>;

  constructor(success: boolean, message: string, data?: T, meta?: Record<string, unknown>) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  static ok<T>(data: T, message = 'Success', meta?: Record<string, unknown>): ApiResponse<T> {
    return new ApiResponse(true, message, data, meta);
  }

  static created<T>(data: T, message = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static noContent<T>(message = 'No content'): ApiResponse<T> {
    return new ApiResponse(true, message);
  }
}
