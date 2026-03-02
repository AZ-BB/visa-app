import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchCountryById, fetchProductsBetweenCountries } from "@/actions/admin"
import { PageHeader } from "@/components/admin-layout/page-header"
import { CountryFlag } from "@/components/ui/country-flag"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductsTableActions } from "./_components/products-table-actions"

export default async function NationalityProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; nationality_id: string }>
  searchParams: Promise<{ view_as?: string }>
}) {
  const { id, nationality_id } = await params
  const { view_as } = await searchParams
  const isDestinationView = view_as !== "nationality"

  const destinationId = isDestinationView ? id : nationality_id
  const nationalityId = isDestinationView ? nationality_id : id

  const [country, otherCountry, products] = await Promise.all([
    fetchCountryById(id),
    fetchCountryById(nationality_id),
    fetchProductsBetweenCountries(destinationId, nationalityId),
  ])

  if (!country || !otherCountry) notFound()

  const breadcrumbs = [
    { label: "Countries", href: "/admin/countries" },
    { label: country.name, href: `/admin/countries/${id}` },
    {
      label: `${otherCountry.name} → ${country.name}`,
      href: undefined,
    },
  ]

  return (
    <>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2 my-4">
            <CountryFlag code={nationalityId} className="size-8 rounded-md" round={false} />
            <span>{otherCountry.name}</span>
            <span className="text-secondary-copy mx-4">→</span>
            <CountryFlag code={destinationId} className="size-8 rounded-md" round={false} />
            <span>{country.name}</span>
          </span>
        }
        description="Visas between these two countries (nationality → destination). Disable, delete, or edit in place."
        breadcrumbs={breadcrumbs}
      />
      <Card className="border-border-default bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border-default hover:bg-transparent">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Visa type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Price
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Status
                </TableHead>
                <TableHead className="w-[140px] text-right text-xs font-semibold uppercase tracking-wider text-secondary-copy">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-12 text-center text-sm text-secondary-copy"
                  >
                    No products for this country pair.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-border-default hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium text-primary-copy">
                      {product.visa_type?.name ?? "—"}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-primary-copy">
                      ${product.price}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={
                          product.is_disabled
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }
                      >
                        {product.is_disabled ? "Disabled" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <ProductsTableActions product={product} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
