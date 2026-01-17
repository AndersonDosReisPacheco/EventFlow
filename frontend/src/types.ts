export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
  }

  export interface EventLog {
    id: string;
    userId: string;
    user?: User;
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'USER' | 'METRIC' | 'AUTH' | 'SETTING';
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
  }

  export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }

  export interface DashboardStats {
    totalEvents: number;
    todayEvents: number;
    userEvents: number;
    loginCount: number;
    lastLogin?: string;
  }

  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      pageSize: number;
      totalPages: number;
      totalItems: number;
    };
  }

  export interface FilterOptions {
    action?: string;
    entity?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }

  export interface ApiError {
    message: string;
    statusCode: number;
    timestamp: string;
  }

  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
  }

  export type ThemeMode = 'light' | 'dark';

  export interface ChartData {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  }

  export interface EventSummary {
    action: string;
    count: number;
    percentage: number;
  }

  export interface TimeSeriesData {
    date: string;
    count: number;
  }

  // Component Props Types
  export interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
  }

  export interface EventTableProps {
    events: EventLog[];
    isLoading: boolean;
    onFilterChange: (filters: FilterOptions) => void;
  }

  export interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  }

  export interface FilterBarProps {
    onFilter: (filters: FilterOptions) => void;
    isLoading: boolean;
  }

  export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }
