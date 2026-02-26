import Link from "next/link"
import { fetchCountries } from "@/actions/countries"
import { CountriesSearchForm } from "./_components/countries-search-form"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CountryFlag } from "@/components/ui/country-flag"

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string; pageSize?: string }>
}) {
  const { search, page, pageSize } = await searchParams
  const parsedPage = Number(page)
  const parsedPageSize = Number(pageSize)
  const countriesPageData = await fetchCountries({
    search,
    page: Number.isFinite(parsedPage) ? parsedPage : undefined,
    pageSize: Number.isFinite(parsedPageSize) ? parsedPageSize : undefined,
  })
  const { countries, total, page: currentPage, totalPages, pageSize: currentPageSize } =
    countriesPageData
  const shownActiveCount = countries.filter((country) => !country.is_disabled).length
  const shownDisabledCount = countries.length - shownActiveCount
  const fromItem = countries.length === 0 ? 0 : (currentPage - 1) * currentPageSize + 1
  const toItem = countries.length === 0 ? 0 : fromItem + countries.length - 1

  const getPageHref = (targetPage: number) => {
    const params = new URLSearchParams()
    if (search?.trim()) {
      params.set("search", search.trim())
    }
    if (currentPageSize !== 20) {
      params.set("pageSize", String(currentPageSize))
    }
    if (targetPage > 1) {
      params.set("page", String(targetPage))
    }
    const queryString = params.toString()
    return queryString ? `/admin/countries?${queryString}` : "/admin/countries"
  }

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 md:px-6">
          <CountriesSearchForm key={search ?? ""} defaultValue={search ?? ""} />
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 hover:bg-transparent">
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Country
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Code
                </TableHead>
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Status
                </TableHead>
                <TableHead className="h-11 w-[96px] text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="py-16 text-center">
                    <div className="mx-auto max-w-sm space-y-2">
                      <p className="text-base font-semibold text-slate-800">No countries found</p>
                      <p className="text-sm text-slate-500">
                        Try adjusting your search term or clear the filter to see all countries.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country) => (
                  <TableRow
                    key={country.id}
                    className="border-slate-100 transition-colors hover:bg-slate-50/70"
                  >
                    <TableCell className="py-3.5">
                      <Link
                        href={`/admin/countries/${country.id}`}
                        className="group inline-flex items-center gap-3 font-medium text-slate-900"
                      >
                        <CountryFlag code={country.id} className="size-6 shrink-0 rounded-sm" round={false} />
                        <span className="transition-colors group-hover:text-primary">{country.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-semibold tracking-wide text-slate-700">
                        {country.id}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span
                        className={
                          country.is_disabled
                            ? "inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                            : "inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                        }
                      >
                        {country.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <Link
                        href={`/admin/countries/${country.id}`}
                        className="rounded-md px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between md:px-6">
            <p className="text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {fromItem}-{toItem}
              </span>{" "}
              of <span className="font-semibold text-slate-900">{total}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage > 1 ? (
                <Link
                  href={getPageHref(currentPage - 1)}
                  className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-slate-100 px-3 font-medium text-slate-400">
                  Previous
                </span>
              )}
              {currentPage < totalPages ? (
                <Link
                  href={getPageHref(currentPage + 1)}
                  className="inline-flex h-9 items-center rounded-md border border-slate-900 bg-slate-900 px-3 font-medium text-white shadow-sm transition hover:bg-slate-800"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-slate-100 px-3 font-medium text-slate-400">
                  Next
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
