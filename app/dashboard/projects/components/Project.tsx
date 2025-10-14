import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import BooleanField from 'app/dashboard/components/table-field/booleanField';

export function Project({ project }: { project: any }) {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt="project image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={project.coverImage.path}
          width="64"
        />
      </TableCell>
      <TableCell className="font-medium">{project.id}</TableCell>
      <TableCell>{project.title}</TableCell>
      <TableCell className="hidden md:table-cell">
        <BooleanField status={project.published} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <BooleanField status={project.isFeatured} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {project.implementCity}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {project.createdAt}
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>
              <form action={() => {}}>
                <button type="submit">Delete</button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
