// ARQUIVO: D:\Meu_Projetos_Pessoais\EventFlow\backend\src\schemas\event.schemas.ts
import { z } from "zod";

export const eventFiltersSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  type: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
