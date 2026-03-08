import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-start h-screen pt-20">
            <h1 className="text-4xl font-bold text-primary-copy">Not found</h1>
            <p className="text-secondary-copy text-lg">The country you are looking for does not exist.</p>
            <Link href="/" className="text-primary hover:underline hover:text-primary-dark transition-colors">Go back to the home page</Link>
        </div>
    )
}