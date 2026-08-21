/**
 * Universal soft/hard delete API for admin
 * POST /api/admin/delete  { entity, id }
 * Supported: campaign, event, volunteer, suggestion
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { can, PERMISSIONS } from "@/lib/constants";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const ENTITY_CONFIG: Record<string, { permission: string; path: string; label: string }> = {
  campaign:   { permission: PERMISSIONS.CAMPAIGNS_MANAGE,  path: "/admin/campaigns",  label: "अभियान" },
  event:      { permission: PERMISSIONS.EVENTS_MANAGE,     path: "/admin/events",     label: "कार्यक्रम" },
  volunteer:  { permission: PERMISSIONS.MEMBERS_MANAGE,    path: "/admin/volunteers", label: "स्वयंसेवक" },
  suggestion: { permission: PERMISSIONS.SETTINGS_MANAGE,   path: "/admin/suggestions",label: "सुझाव" },
};

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const { entity, id } = await req.json().catch(() => ({}));
  if (!entity || !id) return NextResponse.json({ error: "entity and id required." }, { status: 400 });

  const cfg = ENTITY_CONFIG[entity];
  if (!cfg) return NextResponse.json({ error: `Unknown entity: ${entity}` }, { status: 400 });

  if (!can(user.role, cfg.permission))
    return NextResponse.json({ error: "अनुमति नहीं है।" }, { status: 403 });

  try {
    switch (entity) {
      case "campaign":
        await prisma.campaign.delete({ where: { id } });
        break;
      case "event":
        await prisma.event.delete({ where: { id } });
        break;
      case "volunteer":
        await prisma.volunteer.delete({ where: { id } });
        break;
      case "suggestion":
        await prisma.suggestion.delete({ where: { id } });
        break;
    }

    await logAudit({ user, action: "DELETE", entity: cfg.label, entityId: id, summary: `${cfg.label} delete किया` });
    revalidatePath(cfg.path);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: `Delete failed: ${e instanceof Error ? e.message : "unknown"}` }, { status: 500 });
  }
}
