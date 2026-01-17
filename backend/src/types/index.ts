// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  socialName?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  credentials?: Record<string, any>;
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
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}
