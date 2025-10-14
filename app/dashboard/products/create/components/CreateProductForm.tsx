'use client';

import { useState, useRef } from 'react';
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
    .refine(
      (files) => files && Array.isArray(files) && files.length > 0,
      'At least one image is required'
    )
    .refine((files) => !files || files.length <= 5, 'Maximum 5 images allowed')
});

type ProductFormValues = z.infer<typeof productSchema>;

function CreateProductForm({
  categories,
  token
}: {
  categories: { id: string; name: string; image: string }[];
  token: string | undefined;
}) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      stock: true,
      show: true,
      categories: [],
      images: []
    }
  });

  const onSubmit = async (data: ProductFormValues) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = selectedFiles.length + files.length;
    if (total > 5) {
      toast.error('You can upload up to 5 images total');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPreviewImages((prev) => [...prev, ...previews]);
    form.setValue('images', [...(form.getValues('images') || []), ...files]);
    form.trigger('images'); // ✅ manually trigger validation
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewImages(updatedPreviews);
    form.setValue('images', updatedFiles);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
          <Button type="submit" className="font-medium">
            Create Product
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default CreateProductForm;
