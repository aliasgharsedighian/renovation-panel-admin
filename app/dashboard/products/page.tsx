import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsTable } from './components/products-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import ProductCategoriesTable from './components/ProductCategoryTable';
import { notFound, redirect } from 'next/navigation';
import { handleLogout } from 'app/lib/handleLogout';

interface Props {
  searchParams: Promise<{
    page: string;
    status: string;
    method: string;
  }>;
}

const fetchProducts = async (page: string = '1', limit: string = '5') => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/get-all-admin-products?page=${page}&limit=${limit}`,
    requestOptions
  );
  const products = await res.json();
  if (products.statusCode === 401) {
    await handleLogout(token);
  }
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
        <div className="flex items-center">
          <Button className="underline" variant="link">
            <Link href="/dashboard/products?page=1">Products</Link>
          </Button>
          <Button variant="link">
            <Link href="/dashboard/products/categories?page=1">
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
