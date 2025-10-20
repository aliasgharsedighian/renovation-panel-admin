import React from 'react';

async function ShowProductCategoryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>ShowProductCategoryPage {id}</div>;
}

export default ShowProductCategoryPage;
