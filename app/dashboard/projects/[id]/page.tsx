export default async function ProjectIdPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>ProjectIdPage {id}</div>;
}
