import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import BooleanField from 'app/dashboard/components/table-field/booleanField';
import Link from 'next/link';
import { toShamsiDate } from 'app/lib/toShamiDate';

export function Product({ product }: { product: any }) {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt="Product image"
          className="aspect-square rounded-md object-cover"
          height="64"
          src={product.images[0].path}
          width="64"
        />
      </TableCell>
      <TableCell>{product.id}</TableCell>
      <TableCell className="font-medium">{product.title}</TableCell>
      <TableCell>
        <BooleanField status={product.show} />
      </TableCell>
      <TableCell className="hidden md:table-cell">{`${product.price}`}</TableCell>
      <TableCell className="hidden md:table-cell">
        <BooleanField status={product.stock} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {toShamsiDate(product.createdAt)}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}
