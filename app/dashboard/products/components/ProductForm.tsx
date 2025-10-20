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

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be greater than 0'),
  stock: z.boolean(),
  show: z.boolean(),
  categories: z.array(z.number()).nonempty('Select at least one category'),
  images: z
    .any()
    .refine((files) => !files || files.length <= 5, 'Maximum 5 images allowed')
    .optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

function ProductForm({
  categories,
  token,
  product,
  action,
  revalidateData
}: {
  categories: { id: string; name: string; image: string }[];
  token: string | undefined;
  product: any | null;
  action: string;
  revalidateData: any;
}) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || 0,
      stock: product?.stock ? true : false,
      show: product?.show || false,
      categories: product
        ? product?.categories.map((category: any) => category.id)
        : [],
      images: []
    }
  });

  useEffect(() => {
    if (product?.images?.length) {
      const existing = product.images.map((img: any) => img.path);
      setPreviewImages(existing);
    }
  }, [product]);

  const onCreateSubmit = async (data: ProductFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock ? '1' : '0');
    formData.append('show', data.show.toString());
    formData.append('categories', JSON.stringify(data.categories));
    selectedFiles.forEach((file) => formData.append('images', file));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}shop/add-product`,
      {
        method: 'POST',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();

    if (response.statusCode === 201) {
      toast.success(response.message || 'Product created successfully!');
      form.reset();
      setPreviewImages([]);
      setSelectedFiles([]);
      redirect('/dashboard/products');
    } else {
      toast.error(response.message || '❌ Error creating product');
    }
  };

  const onEditSubmit = async (data: ProductFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock ? '1' : '0');
    formData.append('show', data.show.toString());
    formData.append('categories', JSON.stringify(data.categories));
    selectedFiles.forEach((file) => formData.append('images', file));
    formData.append('deletedImages', JSON.stringify(removedImages));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}shop/edit-product/${product.id}`,
      {
        method: 'PUT',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();

    if (response.statusCode === 201) {
      toast.success(response.message || 'Product edit successfully!');
      revalidateData();
      setRemovedImages([]);
    } else {
      toast.error(response.message || '❌ Error creating product');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = previewImages.length + files.length;
    if (total > 5) {
      toast.error('You can upload up to 5 images total');
      return;
    }

    const previews = files.map((f) => URL.createObjectURL(f));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...previews]);
    form.setValue('images', [...(form.getValues('images') || []), ...files]);
    form.trigger('images');
  };

  // ✅ Remove image (handles both old + new)
  const removeImage = (index: number) => {
    const currentPreview = previewImages[index];

    // Check if it's an old image (URL from backend)
    const isExisting = product.images.some(
      (img: any) => img.path === currentPreview
    );

    if (isExisting) {
      // Mark for backend deletion
      const exist = product.images.find(
        (img: any) => img.path === currentPreview
      );

      setRemovedImages((prev) => [...prev, exist.id]);
    } else {
      // It's a newly added image, remove it from selectedFiles too
      const updatedFiles = selectedFiles.filter(
        (_, i) => i !== index - product.images.length
      );
      setSelectedFiles(updatedFiles);
      form.setValue('images', updatedFiles);
    }

    // Remove preview from UI
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              product and remove your data from servers.
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
                    placeholder="Product title"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <TinyEditor
            name="description"
            control={form.control}
            label="Description"
          />

          <div className="w-full flex flex-col md:flex-row items-center gap-4 md:gap-12">
            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => {
                const [open, setOpen] = useState(false);

                return (
                  <FormItem className="w-full">
                    <FormLabel>Categories</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                              'w-full justify-between',
                              !field.value?.length && 'text-muted-foreground'
                            )}
                          >
                            {field.value?.length
                              ? `${field.value.length} selected`
                              : 'Select categories...'}
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
                              {categories.map((category: any) => {
                                const selected = field.value?.includes(
                                  category.id
                                );
                                return (
                                  <CommandItem
                                    key={category.id}
                                    onSelect={() => {
                                      const newValue = selected
                                        ? field.value.filter(
                                            (v) => v !== category.id
                                          )
                                        : [...(field.value || []), category.id];
                                      field.onChange(newValue);
                                    }}
                                  >
                                    <div
                                      className={cn(
                                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                        selected
                                          ? 'bg-primary text-primary-foreground'
                                          : 'opacity-50 [&_svg]:invisible'
                                      )}
                                    >
                                      <Check className="h-4 w-4" />
                                    </div>
                                    {category.name}
                                  </CommandItem>
                                );
                              })}
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
              name="stock"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4 justify-between w-full">
                  <FormLabel>In Stock</FormLabel>
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
              name="show"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4 justify-between w-full">
                  <FormLabel>Show Product</FormLabel>
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

          {/* Custom Image Upload */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="secondary"
                      className=""
                      onClick={() => fileInputRef.current?.click()}
                    >
                      + Add Images
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Image Preview Grid */}
                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previewImages.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-lg overflow-hidden border"
                          >
                            <img
                              src={src}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
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
                Create Product
              </Button>
            )}
            {action === 'edit' && (
              <div className="flex items-center gap-6">
                <Button type="submit" className="font-medium">
                  Edit Product
                </Button>
                <Button
                  onClick={() => setOpenDeleteModal(true)}
                  variant="destructive"
                  type="button"
                  className="font-medium"
                >
                  Delete Product
                </Button>
              </div>
            )}
            <Button asChild variant="secondary">
              <Link href="/dashboard/products?page=1">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

export default ProductForm;
