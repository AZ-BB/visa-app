import AdminNavbar from "@/components/admin-layout/Navbar"
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminUser = user
    ? {
        first_name: (user.user_metadata?.first_name as string) ?? "",
        last_name: (user.user_metadata?.last_name as string) ?? "",
      }
    : null

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg-light-grey ">
      <AdminNavbar user={adminUser} />
      <div className="mx-auto w-full px-4 py-6 sm:px-6">
        {children}
      </div>
    </main>
  )
}
