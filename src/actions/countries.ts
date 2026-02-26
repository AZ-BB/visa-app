"use server"
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server"
import GeneralResponse from "@/types/general"
import { revalidatePath } from "next/cache"

export interface Country {
  id: string
  name: string
  is_disabled: boolean
  created_at: string
  updated_at: string
}

export interface CountriesPageData {
  countries: Country[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function fetchCountries({
  page = 1,
  pageSize = 20,
  search = "",
  status = "all",
}: {
  page?: number
  pageSize?: number
  search?: string
  status?: "all" | "active" | "disabled"
} = {}): Promise<GeneralResponse<CountriesPageData>> {
  const supabase = await createSupabaseServerClient()
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 20
  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1

  let query = supabase
    .from("countries")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .ilike("name", `%${search}%`)

  if (status === "active") {
    query = query.eq("is_disabled", false)
  } else if (status === "disabled") {
    query = query.eq("is_disabled", true)
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return { error: error.message }
  }

  const total = count ?? 0
  return {
    data: {
      countries: data ?? [],
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    },
  }
}


export async function fetchCountryById(id: string): Promise<GeneralResponse<Country | null>> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from("countries").select("*").eq("id", id).single()
  if (error) {
    return { error: error.message }
  }
  return { data }
}


export async function updateCountryDisabledStatus(
  countryId: string,
  isDisabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("countries")
    .update({ is_disabled: isDisabled, updated_at: new Date().toISOString() })
    .eq("id", countryId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/countries")
  return { success: true }
}
