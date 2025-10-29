import React from 'react';

async function ShowProjectCategoryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>ShowProjectCategoryPage {id}</div>;
}

export default ShowProjectCategoryPage;
