import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main>
            <Navbar />
            <div className="mt-20">
                {children}
            </div>
            <Footer />
        </main>
    )
}
