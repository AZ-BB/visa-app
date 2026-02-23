export default async function VisaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div>
            <h1>Visa {id}</h1>
        </div>
    )
}