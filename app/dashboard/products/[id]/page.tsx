export default async function ProductIdPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>ProductIdPage {id}</div>;
}
