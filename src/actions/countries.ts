import { createSupabaseServerClient } from "@/lib/supabase/supabase-server"

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
}: { page?: number; pageSize?: number; search?: string } = {}): Promise<CountriesPageData> {
  const supabase = await createSupabaseServerClient()
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 100) : 20
  const from = (safePage - 1) * safePageSize
  const to = from + safePageSize - 1

  const { data, error, count } = await supabase
    .from("countries")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .ilike("name", `%${search}%`)
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const total = count ?? 0
  return {
    countries: data ?? [],
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  }
}