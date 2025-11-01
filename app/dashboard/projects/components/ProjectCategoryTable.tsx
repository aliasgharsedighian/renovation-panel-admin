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
import DashboardPagination from 'app/dashboard/components/DashboardPagination';
import { Category } from './Category';

interface Props {
  categories: any[];
  totalProjectCategories: number;
  per_page: string;
  page: string;
}

function ProjectCategoriesTable({
  categories,
  totalProjectCategories,
  per_page,
  page
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Categories</CardTitle>
        <CardDescription>
          Manage your project Categories and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] md:w-[200px] sm:table-cell">
                Image
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <Category key={category.id} category={category} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <DashboardPagination
          per_page={per_page}
          page={page}
          posts={totalProjectCategories || per_page}
        />
      </CardFooter>
    </Card>
  );
}

export default ProjectCategoriesTable;
