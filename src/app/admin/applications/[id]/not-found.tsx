import Link from "next/link";

export default function ApplicationsNotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold text-primary-copy">Not found</h1>
            <p className="text-secondary-copy text-lg">The application you are looking for does not exist.</p>
            <Link href="/admin/applications" className="text-primary hover:underline hover:text-primary-dark transition-colors">Go back to the applications page</Link>
        </div>
    )
}