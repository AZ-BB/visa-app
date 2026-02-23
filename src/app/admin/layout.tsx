import AdminNavbar from "@/components/admin-layout/Navbar"

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main>
            <AdminNavbar />
            <div className="p-4">
                {children}
            </div>
        </main>
    )
}
