export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
