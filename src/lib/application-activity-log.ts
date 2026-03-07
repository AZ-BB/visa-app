"use server";

import { createSupabaseAdminServerClient } from "@/lib/supabase/supabase-server";
import type { Json } from "@/database.types";

export type ActivityActionType =
  | "ASSIGNED_ADMIN"
  | "STATUS_CHANGED"
  | "REFUNDED"
  | "APPLICATION_EDITED"
  | "APPLICATION_CREATED"
  | "APPLICATION_DELETED";

export type ActivityActorType = "admin" | "client";

export async function logApplicationActivity(params: {
  applicationId: string;
  actionType: ActivityActionType;
  actorId: string;
  actorType: ActivityActorType;
  content: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = await createSupabaseAdminServerClient();
    await supabase.from("application_activity_log").insert({
      application_id: params.applicationId,
      action_type: params.actionType,
      actor_id: params.actorId,
      actor_type: params.actorType,
      content: params.content as Json,
    });
  } catch (err) {
    console.error("Failed to log application activity:", err);
  }
}
