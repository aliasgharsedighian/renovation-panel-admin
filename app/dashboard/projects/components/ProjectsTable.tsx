'use client';

import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Project } from './Project';
import DashboardPagination from 'app/dashboard/components/DashboardPagination';

export function ProjectsTable({
  projects,
  offset,
  totalProjects,
  per_page,
  page
}: {
  projects: any;
  offset: number;
  totalProjects: number;
  per_page: string;
  page: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Manage your Projects and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                Cover Image
              </TableHead>
              <TableHead>id</TableHead>
              <TableHead>title</TableHead>
              <TableHead className="hidden md:table-cell">published</TableHead>
              <TableHead className="hidden md:table-cell">Featured</TableHead>
              <TableHead className="hidden md:table-cell">
                Implement City
              </TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project: any) => (
              <Project key={project.id} project={project} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <DashboardPagination
          per_page={per_page}
          page={page}
          posts={totalProjects || per_page}
        />
      </CardFooter>
    </Card>
  );
}
