export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: AdminUser;
}

export interface AdminUser {
  userId: string;
  email: string;
  role: string;
}
