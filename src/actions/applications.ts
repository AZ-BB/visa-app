"use server";

import { revalidatePath } from "next/cache";
import {
  createSupabaseServerClient,
  createSupabaseAdminServerClient,
} from "@/lib/supabase/supabase-server";
import { Tables } from "@/database.types";
import GeneralResponse from "@/types/general";
import { getUser } from "@/lib/get-user";
import { ApplicationStatus } from "@/enums";
import { logApplicationActivity } from "@/lib/application-activity-log";

export async function createApplicationClient({
  arrival_date,
  contact_email,
  destination_country,
  visa_type_id,
  travellers = [],
  turnaround_time_id,
}: {
  arrival_date: string;
  contact_email: string;
  destination_country: string;
  visa_type_id: number;
  travellers: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    passport_number: string;
    passport_expiry_date: string;
    country_of_birth: string;
    country_of_residence: string;
    nationality: string;
    product_id: number;
  }[];
  turnaround_time_id: number;
}): Promise<GeneralResponse<string>> {
  try {
    const supabase = await createSupabaseServerClient();

    const user = await getUser();
    if (!user || !user.profile) {
      return {
        status: false,
        error: "User not found",
      };
    }

    if (travellers.length === 0) {
      return {
        status: false,
        error: "At least one traveller is required",
      };
    }

    if (
      travellers.some(
        (traveller) =>
          !traveller.last_name ||
          !traveller.first_name ||
          !traveller.date_of_birth ||
          !traveller.passport_number ||
          !traveller.passport_expiry_date ||
          !traveller.country_of_birth ||
          !traveller.country_of_residence ||
          !traveller.nationality ||
          !traveller.product_id,
      )
    ) {
      return {
        status: false,
        error: "Invalid traveller data",
      };
    }

    const { data: destinationCountryData, error: destinationCountryError } =
      await supabase
        .from("countries")
        .select("*")
        .eq("id", destination_country)
        .single();

    if (destinationCountryError || !destinationCountryData) {
      return {
        status: false,
        error: "Destination country not found",
      };
    }

    const { data: turnaroundTimeData, error: turnaroundTimeError } =
      await supabase
        .from("turnaround_times")
        .select("*")
        .eq("id", turnaround_time_id)
        .eq("is_disabled", false)
        .single();

    if (turnaroundTimeError || !turnaroundTimeData) {
      return {
        status: false,
        error:
          "Turnaround plan not available for this destination. Please select a different turnaround plan.",
      };
    }

    const { data: visaTypeData, error: visaTypeError } = await supabase
      .from("visa_types")
      .select("*")
      .eq("destination_country", destinationCountryData.id)
      .eq("id", visa_type_id)
      .single();

    if (visaTypeError || !visaTypeData) {
      return {
        status: false,
        error: "Visa type not found",
      };
    }

    if (visaTypeData.is_disabled || visaTypeData.deleted_at) {
      return {
        status: false,
        error:
          "The visa you selected is currently unavailable. Please select a different visa type.",
      };
    }

    const travellersNationalities: string[] = travellers.map(
      (traveller) => traveller.nationality,
    );
    const { data: visaRulesData, error: visaRulesError } = await supabase
      .from("visa_rules")
      .select("*")
      .in("nationality", travellersNationalities)
      .eq("destination_country", destinationCountryData.id);

    if (visaRulesError || !visaRulesData) {
      return {
        status: false,
        error: "Failed to get visa rules",
      };
    }

    if (
      visaRulesData.some(
        (visaRule) => !visaRule.is_supported || !visaRule.is_visa_required,
      )
    ) {
      return {
        status: false,
        error:
          "One or more of your travellers are not eligible for this visa. Please check the visa rules and try again.",
      };
    }

    let totalGovFee = 0;
    let totalProcessingFee = 0;
    let totalTurnaroundFee = 0;
    const dbTravellers: Omit<
      Tables<"travellers">,
      "id" | "created_at" | "updated_at" | "application_id"
    >[] = [];

    for (const traveller of travellers) {
      let visaRule = visaRulesData.find(
        (visaRule) => visaRule.nationality === traveller.nationality,
      );

      if (!visaRule) {
        const { data: newVisaRule, error: newVisaRuleError } = await supabase
          .from("visa_rules")
          .select("*")
          .eq("nationality", traveller.nationality)
          .eq("destination_country", destinationCountryData.id)
          .single();

        if (newVisaRuleError || !newVisaRule) {
          return {
            status: false,
            error: "Failed to create visa rule",
          };
        }

        visaRule = newVisaRule;
      }

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("visa_type_id", visaTypeData.id)
        .eq("visa_rule_id", visaRule.id)
        .single();

      if (productError || !productData) {
        return {
          status: false,
          error: "Failed to get product",
        };
      }

      if (productData.is_disabled || productData.deleted_at) {
        return {
          status: false,
          error:
            "One or more of your travellers are not eligible for this visa. Please check the visa rules and try again.",
        };
      }

      totalGovFee += productData.gov_fee_override ?? visaTypeData.gov_fee;
      totalProcessingFee +=
        productData.processing_fee_override ?? visaTypeData.processing_fee;

      dbTravellers.push({
        first_name: traveller.first_name,
        last_name: traveller.last_name,
        date_of_birth: traveller.date_of_birth,

        passport_number: traveller.passport_number,
        passport_expiry_date: traveller.passport_expiry_date,

        country_of_birth: traveller.country_of_birth,
        country_of_residence: traveller.country_of_residence,
        nationality: traveller.nationality,

        product_id: productData.id,
        gov_fee: productData.gov_fee_override ?? visaTypeData.gov_fee,
        processing_fee:
          productData.processing_fee_override ?? visaTypeData.processing_fee,
      });
    }

    totalTurnaroundFee += turnaroundTimeData.fee;

    const { data: applicationData, error: applicationError } = await supabase
      .from("applications")
      .insert({
        profile_id: user.profile.id,
        turnaround_time_id: turnaroundTimeData.id,
        arrival_date,
        contact_email,
        status: "NOT_STARTED",
        gov_fee: totalGovFee,
        processing_fee: totalProcessingFee,
        turnaround_fee: totalTurnaroundFee,
        total_fee: totalGovFee + totalProcessingFee + totalTurnaroundFee,
        destination_country_id: destinationCountryData.id,
        visa_type_id: visaTypeData.id,
      })
      .select();

    if (applicationError || !applicationData) {
      return {
        status: false,
        error: "Failed to create application",
      };
    }

    const { error: travellersError } = await supabase.from("travellers").insert(
      dbTravellers.map((traveller) => ({
        ...traveller,
        application_id: applicationData[0].id,
      })),
    );

    if (travellersError) {
      return {
        status: false,
        error: "Failed to create travellers",
      };
    }

    await logApplicationActivity({
      applicationId: applicationData[0].id,
      actionType: "APPLICATION_CREATED",
      actorId: user.profile.id,
      actorType: "client",
      content: { summary: "Application created by client" },
    });

    return {
      status: true,
      message: "Application created successfully",
      data: applicationData[0].id,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: "Failed to create application",
    };
  }
}

export type ApplicationList = {
  id: string;

  destination_country_id: string;
  destination_country_name: string;

  visa_type_id: number;
  visa_type_name: string;

  assigned_to_id: string | null;
  assigned_to_name: string;

  status: ApplicationStatus;
  turnaround_time_id: number;
  total_fee: number;
  amount_paid_cents?: number | null;
  amount_refunded_cents?: number;

  client_name: string;
  contact_email: string;

  travellers: {
    first_name: string;
    last_name: string;
    nationality: string;
  }[];

  arrival_date: string;
  created_at: string;
  updated_at: string;
}[];

export async function getApplications(
  page: number = 1,
  limit: number = 10,
  filter: {
    status?: ApplicationStatus;
    assigned_to_id?: string;
    search?: string;
    profile_id?: string;

    destination?: string;
    nationality?: string;
    refunded_filter?: "all" | "refunded_only";

    sort:
      | "arrival_date"
      | "created_at"
      | "updated_at"
      | "status"
      | "client_name"
      | "total_fee";
    order: "asc" | "desc";
  },
): Promise<GeneralResponse<{ applications: ApplicationList; total: number }>> {
  try {
    const supabase = await createSupabaseServerClient();

    const isUnassignedFilter = filter.assigned_to_id === "__unassigned__";
    const { data, error } = await supabase.rpc("list_applications_admin", {
      p_page: page,
      p_limit: limit,
      p_search: filter.search ?? undefined,
      p_status: filter.status ?? undefined,
      p_assigned_to_id: isUnassignedFilter
        ? undefined
        : (filter.assigned_to_id ?? undefined),
      p_destination_id: filter.destination ?? undefined,
      p_nationality_id: filter.nationality ?? undefined,
      p_sort: filter.sort,
      p_order: filter.order,
      p_filter_unassigned: isUnassignedFilter,
      p_profile_id: filter.profile_id ?? undefined,
      p_refunded_filter: filter.refunded_filter ?? "all",
    });

    if (error) {
      return {
        status: false,
        error: error.message,
      };
    }

    const result = data as unknown as
      | { error?: string; applications?: ApplicationList; total?: number }
      | null
      | undefined;
    if (result?.error) {
      return {
        status: false,
        error: result.error,
      };
    }

    return {
      status: true,
      data: {
        applications: result?.applications ?? [],
        total: result?.total ?? 0,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: "Failed to get applications",
    };
  }
}

export async function getApplicationCount(): Promise<
  GeneralResponse<{
    total: number;
    in_progress: number;
    completed: number;
    total_fee: number;
    total_paid: number;
    refunded_amount: number;
    total_revenue: number;
  }>
> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("get_application_counts");

    if (error) {
      return {
        status: false,
        error: error.message,
      };
    }

    const result = data as {
      total: number;
      in_progress: number;
      completed: number;
      total_fee: number;
      total_paid?: number;
      refunded_amount?: number;
      total_revenue?: number;
    } | null;
    if (!result) {
      return {
        status: false,
        error: "Failed to get application count",
      };
    }

    return {
      status: true,
      data: {
        total: Number(result.total) ?? 0,
        in_progress: Number(result.in_progress) ?? 0,
        completed: Number(result.completed) ?? 0,
        total_fee: Number(result.total_fee) ?? 0,
        total_paid: Number(result.total_paid ?? result.total_fee) ?? 0,
        refunded_amount: Number(result.refunded_amount) ?? 0,
        total_revenue: Number(result.total_revenue ?? (result.total_fee ?? 0) - (result.refunded_amount ?? 0)) ?? 0,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: "Failed to get application count",
    };
  }
}

export type Application = Tables<"applications"> & {
  destination_country: Tables<"countries">;
  visa_type: Tables<"visa_types">;
  turnaround_time: Tables<"turnaround_times">;
  travellers: Tables<"travellers"> &
    {
      product: Tables<"products">;
    }[];
};

export async function getApplication(
  id: string,
): Promise<GeneralResponse<Application>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("applications")
      .select(`
            *,
            destination_country:countries(*),
            visa_type:visa_types(*),
            turnaround_times(*),
            travellers(*, product:products(*))
        `)
      .eq("id", id).eq("is_paid", true)
      .single();

    if (error || !data) {
      return {
        status: false,
        error: error.message,
      };
    }

    return {
      status: true,
      data: data as unknown as Application,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: "Failed to get application",
    };
  }
}

export type ActivityLogEntry = {
  id: string;
  application_id: string;
  created_at: string;
  action_type: string;
  actor_id: string | null;
  actor_type: string;
  content: Record<string, unknown>;
  actor_name: string;
};

export async function getApplicationActivityLogs(
  applicationId: string,
): Promise<GeneralResponse<ActivityLogEntry[]>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: logs, error } = await supabase
      .from("application_activity_log")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    if (error) {
      return { status: false, error: error.message };
    }

    const entries = (logs ?? []) as {
      id: string;
      application_id: string;
      created_at: string;
      action_type: string;
      actor_id: string | null;
      actor_type: string;
      content: Record<string, unknown>;
    }[];

    const adminIds = [...new Set(entries.filter((e) => e.actor_type === "admin" && e.actor_id).map((e) => e.actor_id!))];
    const clientIds = [...new Set(entries.filter((e) => e.actor_type === "client" && e.actor_id).map((e) => e.actor_id!))];

    const adminMap: Record<string, string> = {};
    const clientMap: Record<string, string> = {};

    if (adminIds.length > 0) {
      const { data: admins } = await supabase
        .from("admin")
        .select("id, first_name, last_name")
        .in("id", adminIds);
      for (const a of admins ?? []) {
        adminMap[a.id] = `${a.first_name} ${a.last_name}`;
      }
    }
    if (clientIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", clientIds);
      for (const p of profiles ?? []) {
        clientMap[p.id] = `${p.first_name} ${p.last_name}`;
      }
    }

    const result: ActivityLogEntry[] = entries.map((e) => ({
      ...e,
      actor_name:
        e.actor_type === "admin" && e.actor_id
          ? adminMap[e.actor_id] ?? "Admin"
          : e.actor_type === "client" && e.actor_id
            ? clientMap[e.actor_id] ?? "Client"
            : "System",
    }));

    return { status: true, data: result };
  } catch (error) {
    console.error(error);
    return { status: false, error: "Failed to get activity logs" };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<GeneralResponse<void>> {
  try {
    const supabase = await createSupabaseServerClient();
    const user = await getUser();
    if (!user?.admin) {
      return { status: false, error: "Unauthorized" };
    }

    const { data: current } = await supabase
      .from("applications")
      .select("status")
      .eq("id", applicationId)
      .single();

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);

    if (error) {
      return {
        status: false,
        error: error.message,
      };
    }

    const fromStatus = (current?.status as ApplicationStatus) ?? null;
    if (fromStatus !== status) {
      await logApplicationActivity({
        applicationId,
        actionType: "STATUS_CHANGED",
        actorId: user.admin.id,
        actorType: "admin",
        content: { from: fromStatus ?? "unknown", to: status },
      });
    }

    return { status: true };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: "Failed to update status",
    };
  }
}

export type TravellerUpdate = {
  id: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  passport_number?: string;
  passport_expiry_date?: string;
  country_of_birth?: string;
  country_of_residence?: string;
  nationality?: string;
};

/** Update application (super_admin and supervisor only). Validates nationality via isVisaAvailable. */
export async function updateApplicationAdmin(
  applicationId: string,
  updates: {
    contact_email?: string;
    arrival_date?: string;
    travellers?: TravellerUpdate[];
  },
): Promise<GeneralResponse<{ feeChanged?: boolean; newTotalFee?: number }>> {
  try {
    const { getCurrentAdmin } = await import("@/actions/admins");
    const isVisaAvailable = (await import("@/actions/visas")).default;

    const adminRes = await getCurrentAdmin();
    if (!adminRes.status || !adminRes.data) {
      return { status: false, error: "Unauthorized" };
    }
    const role = adminRes.data.role;
    if (role !== "SUPER_ADMIN" && role !== "SUPERVISOR") {
      return { status: false, error: "Only super admins and supervisors can edit applications" };
    }

    const supabase = await createSupabaseServerClient();
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        contact_email,
        arrival_date,
        destination_country_id,
        visa_type_id,
        turnaround_time_id,
        total_fee,
        gov_fee,
        processing_fee,
        turnaround_fee,
        is_paid,
        travellers(*, product:products(*))
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      return { status: false, error: appError?.message ?? "Application not found" };
    }

    const travellers = (app as { travellers?: unknown[] }).travellers ?? [];
    const travellerUpdates = updates.travellers ?? [];

    if (updates.contact_email !== undefined) {
      const email = updates.contact_email.trim();
      if (!email) return { status: false, error: "Contact email is required" };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { status: false, error: "Please enter a valid email address" };
      }
    }

    if (updates.arrival_date !== undefined) {
      const d = updates.arrival_date.trim();
      if (!d) return { status: false, error: "Arrival date is required" };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const arrivalDate = new Date(d + "T12:00:00");
      if (arrivalDate < today) {
        return { status: false, error: "Arrival date cannot be in the past" };
      }
    }

    const destCountry = app.destination_country_id as string;
    const visaTypeId = app.visa_type_id as number;

    const updatedTravellers: {
      id: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      passport_number: string;
      passport_expiry_date: string;
      country_of_birth: string;
      country_of_residence: string;
      nationality: string;
      product_id: number;
      gov_fee: number;
      processing_fee: number;
    }[] = [];

    let totalGovFee = 0;
    let totalProcessingFee = 0;
    const turnaroundFee = app.turnaround_fee as number;

    const { data: visaType } = await supabase
      .from("visa_types")
      .select("gov_fee, processing_fee")
      .eq("id", visaTypeId)
      .single();

    const baseGovFee = visaType ? Number(visaType.gov_fee) : 0;
    const baseProcessingFee = visaType ? Number(visaType.processing_fee) : 0;

    for (const t of travellers) {
      const tData = t as {
        id: string;
        first_name: string;
        last_name: string;
        date_of_birth: string;
        passport_number: string;
        passport_expiry_date: string;
        country_of_birth: string;
        country_of_residence: string;
        nationality: string;
        product_id: number;
        gov_fee: number;
        processing_fee: number;
        product?: { gov_fee_override: number | null; processing_fee_override: number | null };
      };
      const patch = travellerUpdates.find((u) => u.id === tData.id);

      const firstName = (patch?.first_name ?? tData.first_name)?.trim() ?? "";
      const lastName = (patch?.last_name ?? tData.last_name)?.trim() ?? "";
      const dob = patch?.date_of_birth ?? tData.date_of_birth;
      const passportNum = (patch?.passport_number ?? tData.passport_number)?.trim() ?? "";
      const passportExpiry = patch?.passport_expiry_date ?? tData.passport_expiry_date;
      const countryOfBirth = patch?.country_of_birth ?? tData.country_of_birth;
      const countryOfResidence = patch?.country_of_residence ?? tData.country_of_residence;
      const nationality = (patch?.nationality ?? tData.nationality)?.trim() ?? "";

      if (!firstName) return { status: false, error: `Traveller ${tData.id}: First name is required` };
      if (!lastName) return { status: false, error: `Traveller ${tData.id}: Last name is required` };
      if (!dob) return { status: false, error: `Traveller ${tData.id}: Date of birth is required` };
      if (!passportNum) return { status: false, error: `Traveller ${tData.id}: Passport number is required` };
      if (!passportExpiry) return { status: false, error: `Traveller ${tData.id}: Passport expiry is required` };
      if (!countryOfBirth) return { status: false, error: `Traveller ${tData.id}: Country of birth is required` };
      if (!countryOfResidence) return { status: false, error: `Traveller ${tData.id}: Country of residence is required` };
      if (!nationality) return { status: false, error: `Traveller ${tData.id}: Nationality is required` };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dobDate = new Date(dob + "T12:00:00");
      if (dobDate > today) return { status: false, error: `Traveller ${tData.id}: Date of birth cannot be in the future` };
      const expiryDate = new Date(passportExpiry + "T12:00:00");
      if (expiryDate < today) return { status: false, error: `Traveller ${tData.id}: Passport expiry cannot be in the past` };

      let productId = tData.product_id;
      let govFee = Number(tData.gov_fee);
      let processingFee = Number(tData.processing_fee);

      const nationalityChanged = patch?.nationality !== undefined && patch.nationality !== tData.nationality;
      if (nationalityChanged) {
        const visaRes = await isVisaAvailable(destCountry, nationality, visaTypeId);
        if (!visaRes.status || !visaRes.data) {
          return { status: false, error: visaRes.error ?? "Nationality not eligible for this visa" };
        }
        const product = visaRes.data;
        productId = product.id;
        govFee = Number(product.gov_fee_override ?? baseGovFee);
        processingFee = Number(product.processing_fee_override ?? baseProcessingFee);
      }

      totalGovFee += govFee;
      totalProcessingFee += processingFee;

      updatedTravellers.push({
        id: tData.id,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob,
        passport_number: passportNum,
        passport_expiry_date: passportExpiry,
        country_of_birth: countryOfBirth,
        country_of_residence: countryOfResidence,
        nationality,
        product_id: productId,
        gov_fee: govFee,
        processing_fee: processingFee,
      });
    }

    const newTotalFee = totalGovFee + totalProcessingFee + turnaroundFee;
    const feeChanged = Math.abs(newTotalFee - (app.total_fee as number)) > 0.001;
    const isPaid = app.is_paid === true;

    for (const t of updatedTravellers) {
      const { id, ...rest } = t;
      const { error: travellerError } = await supabase
        .from("travellers")
        .update(rest)
        .eq("id", id);
      if (travellerError) {
        return { status: false, error: travellerError.message };
      }
    }

    const appUpdate: Record<string, unknown> = {
      gov_fee: totalGovFee,
      processing_fee: totalProcessingFee,
      total_fee: newTotalFee,
    };
    if (updates.contact_email !== undefined) appUpdate.contact_email = updates.contact_email.trim();
    if (updates.arrival_date !== undefined) appUpdate.arrival_date = updates.arrival_date;

    const { error: appUpdateError } = await supabase
      .from("applications")
      .update(appUpdate)
      .eq("id", applicationId);

    if (appUpdateError) {
      return { status: false, error: appUpdateError.message };
    }

    const summaryParts: string[] = [];
    if (updates.contact_email !== undefined && updates.contact_email.trim() !== (app.contact_email as string)) {
      summaryParts.push("Contact email changed");
    }
    if (updates.arrival_date !== undefined && updates.arrival_date !== (app.arrival_date as string)) {
      summaryParts.push("Arrival date changed");
    }
    for (const patch of travellerUpdates) {
      const tData = travellers.find((t) => (t as { id: string }).id === patch.id) as {
        first_name?: string;
        last_name?: string;
        date_of_birth?: string;
        passport_number?: string;
        passport_expiry_date?: string;
        country_of_birth?: string;
        country_of_residence?: string;
        nationality?: string;
      } | undefined;
      if (!tData) continue;
      const changes: string[] = [];
      if (patch.first_name !== undefined && patch.first_name !== tData.first_name) changes.push("first name");
      if (patch.last_name !== undefined && patch.last_name !== tData.last_name) changes.push("last name");
      if (patch.date_of_birth !== undefined && patch.date_of_birth !== tData.date_of_birth) changes.push("date of birth");
      if (patch.passport_number !== undefined && patch.passport_number !== tData.passport_number) changes.push("passport number");
      if (patch.passport_expiry_date !== undefined && patch.passport_expiry_date !== tData.passport_expiry_date) changes.push("passport expiry");
      if (patch.country_of_birth !== undefined && patch.country_of_birth !== tData.country_of_birth) changes.push("country of birth");
      if (patch.country_of_residence !== undefined && patch.country_of_residence !== tData.country_of_residence) changes.push("country of residence");
      if (patch.nationality !== undefined && patch.nationality !== tData.nationality) changes.push("nationality");
      if (changes.length > 0) {
        const idx = travellers.findIndex((t) => (t as { id: string }).id === patch.id) + 1;
        summaryParts.push(`Traveller ${idx}: ${changes.join(", ")} changed`);
      }
    }
    if (summaryParts.length > 0) {
      await logApplicationActivity({
        applicationId,
        actionType: "APPLICATION_EDITED",
        actorId: adminRes.data.id,
        actorType: "admin",
        content: { summary: summaryParts.join("; ") },
      });
    }

    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/admin/applications");
    revalidatePath("/admin/clients");

    return {
      status: true,
      data: {
        feeChanged: feeChanged && isPaid,
        newTotalFee,
      },
    };
  } catch (error) {
    console.error(error);
    return { status: false, error: "Failed to update application" };
  }
}

export async function updateApplicationAssignee(
  applicationId: string,
  assignedToId: string | null,
): Promise<GeneralResponse<void>> {
  try {
    const supabase = await createSupabaseServerClient();
    const user = await getUser();
    if (!user?.admin) {
      return { status: false, error: "Unauthorized" };
    }

    const { data: current } = await supabase
      .from("applications")
      .select("assigned_to")
      .eq("id", applicationId)
      .single();

    const { error } = await supabase
      .from("applications")
      .update({ assigned_to: assignedToId })
      .eq("id", applicationId);

    if (error) {
      return {
        status: false,
        error: error.message,
      };
    }

    const fromId = (current?.assigned_to as string | null) ?? null;
    if (fromId !== assignedToId) {
      await logApplicationActivity({
        applicationId,
        actionType: "ASSIGNED_ADMIN",
        actorId: user.admin.id,
        actorType: "admin",
        content: { from_admin_id: fromId, to_admin_id: assignedToId },
      });
    }

    return { status: true };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: "Failed to update assignment",
    };
  }
}
