export default async function CountryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div>
            <h1>Country {id}</h1>
        </div>
    )
}