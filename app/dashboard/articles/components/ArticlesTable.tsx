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
import { Article } from './Article';

export function ArticlesTable({
  products,
  totalArticles,
  per_page,
  page
}: {
  products: any[];
  totalArticles: number;
  per_page: string;
  page: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Articles</CardTitle>
        <CardDescription>
          Manage your Articles and view their sales performance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                Image
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Show</TableHead>
              <TableHead className="hidden md:table-cell">
                Is Featured
              </TableHead>
              <TableHead className="hidden md:table-cell">Excerpt</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((article) => (
              <Article key={article.id} article={article} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <DashboardPagination
          per_page={per_page}
          page={page}
          posts={totalArticles || per_page}
        />
      </CardFooter>
    </Card>
  );
}
