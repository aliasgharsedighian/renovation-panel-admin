import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ArticleCategoriesTable from '../components/ArticleCategoriesTable';

interface Props {
  searchParams: Promise<{
    page: string;
    status: string;
    method: string;
  }>;
}

const getAllArticleCategories = async (
  page: string = '1',
  limit: string = '10'
) => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}article/show-categories-article?page=${page}&limit=${limit}`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

async function ArticleCategoriesPage({ searchParams }: Props) {
  const per_page = '10';
  const { page, status, method } = await searchParams;

  const categories = await getAllArticleCategories(page, per_page);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div className="flex items-center">
          <Button variant="link">
            <Link href="/dashboard/articles?page=1">Articles</Link>
          </Button>
          <Button variant="link">
            <Link
              className="underline"
              href="/dashboard/articles/categories?page=1"
            >
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
                Add Article
              </span>
            </Link>
          </Button>
        </div>
      </div>{' '}
      <ArticleCategoriesTable
        categories={categories.articleCategories}
        totalArticleCategories={categories.totalCount}
        per_page={per_page}
        page={page}
      />
    </div>
  );
}

export default ArticleCategoriesPage;
