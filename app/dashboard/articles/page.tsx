import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { handleLogout } from 'app/lib/handleLogout';
import { ArticlesTable } from './components/ArticlesTable';

interface Props {
  searchParams: Promise<{
    page: string;
    status: string;
    method: string;
  }>;
}

const fetchArticles = async (page: string = '1', limit: string = '5') => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}article/get-all-articles-admin?page=${page}&limit=${limit}`,
    requestOptions
  );
  const articles = await res.json();
  if (articles.statusCode === 401) {
    await handleLogout(token);
  }
  return articles.data;
};

async function DashboardArticlePage({ searchParams }: Props) {
  const per_page = '5';
  const { page, status, method } = await searchParams;

  const { articles, totalCount, currentPage, totalPages } = await fetchArticles(
    page,
    per_page
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div className="flex items-center">
          <Button className="underline" variant="link">
            <Link href="/dashboard/articles?page=1">Artciles</Link>
          </Button>
          <Button variant="link">
            <Link href="/dashboard/articles/categories?page=1">
              Articles Categories
            </Link>
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" asChild size="sm" className="h-8 gap-1">
            <Link href="/dashboard/articles/create-category">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Category Article
              </span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/dashboard/articles/create">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Artcile
              </span>
            </Link>
          </Button>
        </div>
      </div>{' '}
      <ArticlesTable
        products={articles}
        totalArticles={totalCount}
        per_page={per_page}
        page={page}
      />
    </div>
  );
}

export default DashboardArticlePage;
