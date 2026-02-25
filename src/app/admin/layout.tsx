import AdminNavbar from "@/components/admin-layout/Navbar"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-screen bg-bg-light-grey">
      <AdminNavbar />
      <div className="mx-auto w-[100vw] px-4 py-6 sm:px-6">
        {children}
      </div>
    </main>
  )
}
