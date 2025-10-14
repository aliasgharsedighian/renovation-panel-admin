import React from 'react';
import { ProductsTable } from './components/products-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{
    page: string;
    status: string;
    method: string;
  }>;
}

const fetchProducts = async (page: string = '1', limit: string = '5') => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/get-all-products?page=${page}&limit=${limit}`,
    {
      cache: 'no-cache'
    }
  );
  const products = await res.json();
  return products.data;
};

async function DashboardProductPage({ searchParams }: Props) {
  const per_page = '5';
  const { page, status, method } = await searchParams;

  const { products, totalCount, currentPage, totalPages } = await fetchProducts(
    page,
    per_page
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div></div>
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
      </div>
      <ProductsTable
        products={products}
        offset={0}
        totalProducts={totalCount}
        per_page={per_page}
        page={page}
      />
    </div>
  );
}

export default DashboardProductPage;
