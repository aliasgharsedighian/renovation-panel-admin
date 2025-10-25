'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { TinyEditor } from 'app/dashboard/components/TinyEditor';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().min(5, 'Excerpt is required'),
  body: z.string().min(1, 'Description is required'),
  published: z.boolean(),
  isFeatured: z.boolean(),
  category: z.number(),
  image: z
    .instanceof(File)
    .or(z.null())
    .refine((file) => file instanceof File, 'Image is required')
    .nullable()
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function ArticleForm({
  categories,
  token,
  article,
  action,
  revalidateData
}: {
  categories: { id: string; name: string; image: string }[];
  token: string | undefined;
  article: any | null;
  action: string;
  revalidateData: any;
}) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      excerpt: article?.excerpt || '',
      body: article?.body || '',
      isFeatured: article?.isFeatured ? true : false,
      published: article?.published || false,
      category: article?.categoryId || '',

      image: null
    }
  });

  useEffect(() => {
    if (article?.coverImage.path) {
      const existing = article.coverImage.path;
      setPreview(existing);
    }
  }, [article]);

  const onCreateSubmit = async (data: ArticleFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('excerpt', data.excerpt);
    formData.append('body', data.body);
    formData.append('isFeatured', data.isFeatured.toString());
    formData.append('published', data.published.toString());
    formData.append('categoryId', JSON.stringify(data.category));
    if (selectedFile) formData.append('image', selectedFile);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}article/add-article`,
      {
        method: 'POST',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();

    if (response.statusCode === 201) {
      toast.success(response.message || 'article created successfully!');
      form.reset();
      setPreview(null);
      setSelectedFile(null);
      redirect('/dashboard/articles?page=1');
    } else {
      toast.error(response.message || '❌ Error creating article');
    }
  };

  const onEditSubmit = async (data: ArticleFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('excerpt', data.excerpt);
    formData.append('body', data.body);
    formData.append('isFeatured', data.isFeatured.toString());
    formData.append('published', data.published.toString());
    formData.append('categoryId', JSON.stringify(data.category));
    if (selectedFile) formData.append('image', selectedFile);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}article/edit-article/${article.slug}`,
      {
        method: 'PUT',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();

    if (response.statusCode === 200) {
      toast.success(response.message || 'article edit successfully!');
      revalidateData();
    } else {
      toast.error(response.message || '❌ Error creating article');
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

  useEffect(() => {
    console.log(selectedFile);
  }, []);

  return (
    <>
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              article and remove your data from servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive">Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Form {...form}>
        <form
          onSubmit={
            action === 'create'
              ? form.handleSubmit(onCreateSubmit)
              : form.handleSubmit(onEditSubmit)
          }
          className="space-y-4 md:space-y-8"
        >
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="article title"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="article slug"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Excerpt */}
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Input
                    placeholder="article excerpt"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <TinyEditor name="body" control={form.control} label="body" />

          <div className="w-full flex flex-col md:flex-row items-center gap-4 md:gap-12">
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => {
                const [open, setOpen] = useState(false);

                return (
                  <FormItem className="w-full">
                    <FormLabel>Category</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              'w-full justify-between',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value
                              ? categories.find(
                                  (cat: any) => cat.id === field.value
                                )?.name
                              : 'Select a category...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category: any) => (
                                <CommandItem
                                  key={category.id}
                                  onSelect={() => {
                                    field.onChange(category.id);
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      category.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0'
                                    )}
                                  />
                                  {category.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* Stock & Show */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-20 w-fit">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4 justify-between w-full">
                  <FormLabel>isFeatured</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4 justify-between w-full">
                  <FormLabel>Show article</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

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
            {action === 'create' && (
              <Button type="submit" className="font-medium">
                Create article
              </Button>
            )}
            {action === 'edit' && (
              <div className="flex items-center gap-6">
                <Button type="submit" className="font-medium">
                  Edit article
                </Button>
                <Button
                  onClick={() => setOpenDeleteModal(true)}
                  variant="destructive"
                  type="button"
                  className="font-medium"
                >
                  Delete article
                </Button>
              </div>
            )}
            <Button asChild variant="secondary">
              <Link href="/dashboard/articles?page=1">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default ArticleForm;
