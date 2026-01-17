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

// Se você tem um arquivo de tipos, atualize a interface Event:
export interface Event {
  id: string;
  type: string;
  message: string;
  userId: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string | Date;
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
  createdAtFormatted?: string;
  timeAgo?: string;
}

export interface DashboardStats {
  totalEvents: number;
  todayEvents: number;
  last7DaysEvents: number;
  last30DaysEvents: number;
  loginEvents: number;
  dashboardEvents: number;
  eventsPerDay: {
    last7DaysAvg: string;
    last30DaysAvg: string;
  };
}

export interface ChartData {
  date: string;
  total: number;
  byType: Record<string, number>;
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
