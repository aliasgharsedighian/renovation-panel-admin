import React from 'react';
import ProductCategoriesTable from '../components/ProductCategoryTable';

interface Props {
  searchParams: Promise<{
    page: string;
    status: string;
    method: string;
  }>;
}

const getAllProductCategories = async (
  page: string = '1',
  limit: string = '10'
) => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/show-category-product?page=${page}&limit=${limit}`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

async function ProductCategoriesPage({ searchParams }: Props) {
  const per_page = '10';
  const { page, status, method } = await searchParams;

  const categories = await getAllProductCategories(page, per_page);
  return (
    <div>
      <ProductCategoriesTable
        categories={categories.productCategories}
        totalProductCategories={categories.totalCount}
        per_page={per_page}
        page={page}
      />
    </div>
  );
}

export default ProductCategoriesPage;
