import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCountryById } from "@/actions/countries";
import { fetchProductsBetweenCountries } from "@/actions/products";
import { getAllVisaTypesForDestination } from "@/actions/visas";
import { CountryFlag } from "@/components/ui/country-flag";
import { ProductsTable } from "./_components/products-table";
import { AddProductModal } from "./_components/add-product-modal";
import {
  ChevronLeft,
  ArrowRight,
  FileText,
} from "lucide-react";

export default async function NationalityProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; nationality_id: string }>;
  searchParams: Promise<{ view_as?: string }>;
}) {
  const { id, nationality_id } = await params;
  const { view_as } = await searchParams;
  const isDestinationView = view_as !== "nationality";

  const destinationId = isDestinationView ? id : nationality_id;
  const nationalityId = isDestinationView ? nationality_id : id;

  const [countryRes, otherCountryRes, productsRes, visaTypesRes] = await Promise.all([
    fetchCountryById(id),
    fetchCountryById(nationality_id),
    fetchProductsBetweenCountries(destinationId, nationalityId),
    getAllVisaTypesForDestination(destinationId),
  ]);

  if (!countryRes.data || !otherCountryRes.data) notFound();

  const country = countryRes.data;
  const otherCountry = otherCountryRes.data;
  const products = productsRes.data ?? [];
  const visaTypes = visaTypesRes.data ?? [];

  const nationalityCountry = isDestinationView ? otherCountry : country;
  const destinationCountry = isDestinationView ? country : otherCountry;

  const existingVisaTypeIds = products
    .map((p) => p.visa_type?.id)
    .filter((id): id is number => id != null);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/admin/countries/${id}?view_as=${view_as ?? "destination"}`}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-copy transition-colors hover:text-primary"
      >
        <ChevronLeft className="size-4" />
        Back to {country.name}
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border-default bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <CountryFlag
                code={nationalityId}
                className="size-8 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                round={false}
              />
              <div>
                <p className="text-xs text-secondary-copy">Nationality</p>
                <p className="font-medium text-primary-copy">{nationalityCountry.name}</p>
              </div>
            </div>

            <ArrowRight className="size-4 text-secondary-copy/50" />

            <div className="flex items-center gap-2.5">
              <CountryFlag
                code={destinationId}
                className="size-8 shrink-0 rounded shadow-sm ring-1 ring-black/5"
                round={false}
              />
              <div>
                <p className="text-xs text-secondary-copy">Destination</p>
                <p className="font-medium text-primary-copy">{destinationCountry.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border-default px-5 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-secondary-copy" />
            <p className="text-sm font-medium text-primary-copy">Visas</p>
            <span className="rounded-full bg-bg-light-grey px-2 py-0.5 text-xs font-medium text-secondary-copy">
              {products.length}
            </span>
          </div>
          <AddProductModal
            destinationCountry={destinationId}
            nationalityId={nationalityId}
            visaTypes={visaTypes}
            existingVisaTypeIds={existingVisaTypeIds}
          />
        </div>

        <ProductsTable products={products} />
      </div>
    </div>
  );
}
