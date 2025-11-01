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

function CategoryProjectForm({
  token,
  category,
  action,
  revalidateData
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      image: null
    }
  });

  useEffect(() => {
    if (category?.image) {
      const existing = category.image;
      setPreview(existing);
    }
  }, [category]);

  const onCreateSubmit = async (data: CategoryFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', data.name);
    if (selectedFile) formData.append('image', selectedFile);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}project/add-project-category`,
      {
        method: 'POST',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();

    if (response.statusCode === 201) {
      toast.success(response.message || '✅ Category created successfully');
      form.reset();
      setPreview(null);
      setSelectedFile(null);
      redirect('/dashboard/projects');
    } else {
      toast.error(response.message || '❌ Something went wrong');
    }
  };

  const onEditSubmit = async (data: CategoryFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('name', data.name);
    if (selectedFile) formData.append('image', selectedFile);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}project/edit-project-category/${category.id}`,
      {
        method: 'PUT',
        headers: myHeaders,
        body: formData
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    form.setValue('image', file);
  };

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(null);
    form.setValue('image', null);
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

        {/* Image */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem className="w-full">
              <FormLabel>Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className=""
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Add Image
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Preview */}
                  {preview && (
                    <div className="relative w-full sm:w-64 h-40 border rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
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
            <Link href="/dashboard/projects?page=1">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CategoryProjectForm;
