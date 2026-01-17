import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class EventService {
  async log(data: {
    type: string;
    message: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: any;
  }) {
    return prisma.event.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId ?? "system",
        ip: data.ip,
        userAgent: data.userAgent,
        metadata: data.metadata,
      },
    });
  }
}

export const eventService = new EventService();
