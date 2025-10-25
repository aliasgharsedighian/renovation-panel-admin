'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface Props {
  token: string | undefined;
  category: any;
  action: 'edit' | 'create';
  revalidateData: any;
}

// 🧩 Zod schema
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z
    .instanceof(File)
    .or(z.null())
    .refine((file) => file instanceof File, 'Image is required')
    .nullable()
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function CategoryArticleForm({
  token,
  category,
  action,
  revalidateData
}: Props) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      image: null
    }
  });

  const onCreateSubmit = async (data: CategoryFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    const rawBody = JSON.stringify({
      name: data.name
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}article/add-article-category`,
      {
        method: 'POST',
        headers: myHeaders,
        body: rawBody
      }
    );

    const response = await res.json();

    if (response.statusCode === 201) {
      toast.success(response.message || '✅ Category created successfully');
      form.reset();
      redirect('/dashboard/articles/categories?page=1');
    } else {
      toast.error(response.message || '❌ Something went wrong');
    }
  };

  const onEditSubmit = async (data: CategoryFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);
    myHeaders.append('Content-Type', 'application/json');

    const rawBody = JSON.stringify({
      name: data.name
    });

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}article/edit-article-category/${category.id}`,
      {
        method: 'POST',
        headers: myHeaders,
        body: rawBody
      }
    );

    const response = await res.json();

    if (response.statusCode === 200) {
      toast.success(response.message || '✅ Category updated successfully');
      revalidateData();
    } else {
      toast.error(response.message || '❌ Something went wrong');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={
          action === 'create'
            ? form.handleSubmit(onCreateSubmit)
            : form.handleSubmit(onEditSubmit)
        }
        className="space-y-8"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Category name"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-6">
          <Button type="submit" className="font-medium">
            {action} Category
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/articles?page=1">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CategoryArticleForm;
