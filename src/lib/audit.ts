import { prisma } from "./db";
import type { SessionUser } from "./auth";

// हर महत्वपूर्ण admin action को audit log में record करें।
export async function logAudit(params: {
  user?: SessionUser | null;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  meta?: unknown;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.user?.id ?? null,
        userName: params.user?.name ?? "System",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        summary: params.summary,
        meta: params.meta ? JSON.stringify(params.meta) : null,
      },
    });
  } catch {
    // audit failure से main flow न रुके
  }
}
