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
  totalArticleCategories: number;
  per_page: string;
  page: string;
}

function ArticleCategoriesTable({
  categories,
  totalArticleCategories,
  per_page,
  page
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Categories</CardTitle>
        <CardDescription>
          Manage your Article Categories and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
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
          posts={totalArticleCategories || per_page}
        />
      </CardFooter>
    </Card>
  );
}

export default ArticleCategoriesTable;
