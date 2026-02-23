import Link from "next/link"

const links = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/visas", label: "Visas" },
  { href: "/admin/countries", label: "Countries" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/fees", label: "Fees" },
]

export default function AdminNavbar() {
  return (
    <nav className="border-b bg-white px-4 py-3">
      <div className="flex gap-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
