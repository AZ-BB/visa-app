export default async function VisasPage(
    { params }: { params: Promise<{ id: string }> } 
) {
    const { id } = await params;
    return (
        <div>
            <h1>Visas for country {id}</h1>
        </div>
    )
}