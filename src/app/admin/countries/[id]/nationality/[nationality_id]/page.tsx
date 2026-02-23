export default async function NationalityPage({ params }: { params: Promise<{ id: string, nationality_id: string }> }) {
    const { id, nationality_id } = await params;
    return (
        <div>
            <h1>Nationality {nationality_id} for country {id}</h1>
        </div>
    )
}