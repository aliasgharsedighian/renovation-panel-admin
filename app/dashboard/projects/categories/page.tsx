import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ProjectCategoriesTable from '../components/ProjectCategoryTable';

interface Props {
  searchParams: Promise<{
    page: string;
    status: string;
    method: string;
  }>;
}

const getAllProjectCategories = async (
  page: string = '1',
  limit: string = '10'
) => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}project/show-all-project-categories?page=${page}&limit=${limit}`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

async function ProjectCategoriesPage({ searchParams }: Props) {
  const per_page = '10';
  const { page, status, method } = await searchParams;

  const categories = await getAllProjectCategories(page, per_page);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div className="flex items-center">
          <Button variant="link">
            <Link href="/dashboard/projects?page=1">Projects</Link>
          </Button>
          <Button variant="link">
            <Link
              className="underline"
              href="/dashboard/projects/categories?page=1"
            >
              Projects Categories
            </Link>
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" asChild size="sm" className="h-8 gap-1">
            <Link href="/dashboard/projects/create-category">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Category Project
              </span>
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/dashboard/projects/create">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Project
              </span>
            </Link>
          </Button>
        </div>
      </div>{' '}
      <ProjectCategoriesTable
        categories={categories.projectCategories}
        totalProjectCategories={categories.totalCount}
        per_page={per_page}
        page={page}
      />
    </div>
  );
}

export default ProjectCategoriesPage;
