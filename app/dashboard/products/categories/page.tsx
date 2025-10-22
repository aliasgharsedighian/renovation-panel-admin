import React from 'react';
import ProductCategoriesTable from '../components/ProductCategoryTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div className="flex items-center">
          <Button variant="link">
            <Link href="/dashboard/products?page=1">Products</Link>
          </Button>
          <Button variant="link">
            <Link
              className="underline"
              href="/dashboard/products/categories?page=1"
            >
              Products Categories
            </Link>
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" asChild size="sm" className="h-8 gap-1">
            <Link href="/dashboard/products/create-category">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Category Product
              </span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/dashboard/products/create">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Link>
          </Button>
        </div>
      </div>{' '}
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
