import React from 'react';
import { ProjectsTable } from './components/ProjectsTable';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

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
    `${process.env.SERVER_ADDRESS}project/get-all-admin-projects?page=${page}&limit=${limit}`,
    requestOptions
  );
  const projects = await res.json();
  return projects.data;
};

async function DashboardProjectPage({ searchParams }: Props) {
  const per_page = '5';
  const { page, status, method } = await searchParams;

  const { projects, totalCount } = await fetchProducts(page, per_page);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <div></div>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Project
            </span>
          </Button>
        </div>
      </div>
      <ProjectsTable
        projects={projects}
        offset={0}
        totalProjects={totalCount}
        per_page={per_page}
        page={page}
      />
    </div>
  );
}

export default DashboardProjectPage;
