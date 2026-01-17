export interface User {
  id: string;
  email: string;
  name: string;
  socialName?: string;
  profilePicture?: string;
  bio?: string;
  credentials?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  type: string;
  message: string;
  userId: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  read: boolean;
  metadata?: any;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
