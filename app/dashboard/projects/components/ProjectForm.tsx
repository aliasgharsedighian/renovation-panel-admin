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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { TinyEditor } from 'app/dashboard/components/TinyEditor';
import { toast } from 'sonner';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// ✅ Zod validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  published: z.boolean(),
  isFeatured: z.boolean(),
  implementCity: z.string().min(1, 'City is required'),
  categoryId: z.number(),
  coverImage: z
    .any()
    .refine((file) => file && file.length === 1, 'One cover image required')
    .nullable(),
  images: z
    .any()
    .refine(
      (files) => !files || files.length <= 20,
      'Maximum 20 images allowed'
    )
    .optional(),
  labels: z.array(z.string().optional()).optional()
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function ProjectForm({
  categories,
  token,
  project,
  action,
  revalidateData
}: {
  categories: { id: number; name: string }[];
  token: string | undefined;
  project?: any | null;
  action: 'create' | 'edit';
  revalidateData?: any;
}) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      content: project?.content || '',
      published: project?.published || false,
      isFeatured: project?.isFeatured || false,
      implementCity: project?.implementCity || '',
      categoryId: project?.categoryId || undefined,
      coverImage: null,
      images: [],
      labels: project?.labels || []
    }
  });

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // 🖼️ Image states
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(
    null
  );
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [numberOfPrevImages, setNumberOfPrevImages] = useState(0);
  const coverRef = useRef<HTMLInputElement | null>(null);
  const imagesRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const cleanLabels = (labels || [])
      .map((l) => l ?? '')
      .slice(numberOfPrevImages, previewImages.length);
    console.log(cleanLabels);
    // console.log(numberOfPrevImages);
  });

  useEffect(() => {
    if (project?.coverImage.path) setCoverPreview(project.coverImage.path);
    if (project?.images?.length > 0) {
      setPreviewImages(project.images.map((img: any) => img.images));
      setLabels(project.images.map((img: any) => img.label));
      setNumberOfPrevImages(project.images.length);
    }
  }, [project]);

  // 🧩 Handle cover image
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file) {
      setSelectedPreviewFile(file);
      setCoverPreview(URL.createObjectURL(file));
      form.setValue('coverImage', [file]);
      form.trigger('coverImage');
    }
  };

  // 🧩 Handle multi-image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = previewImages.length + files.length;
    if (total > 20) {
      toast.error('You can upload up to 20 images total');
      return;
    }

    const previews = files.map((f) => URL.createObjectURL(f));
    setSelectedImages((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...previews]);

    // ensure labels stay aligned and not undefined
    const safeLabels = [...(labels || [])];
    for (let i = 0; i < files.length; i++) {
      safeLabels.push('');
    }

    setLabels(safeLabels);

    form.setValue('images', [...(form.getValues('images') || []), ...files]);
    form.setValue('labels', safeLabels);
  };

  const removeImage = (index: number) => {
    const currentPreview = previewImages[index];
    const isExisting = project.images.some(
      (img: any) => img.images === currentPreview
    );
    if (isExisting) {
      // Mark for backend deletion
      const exist = project.images.find(
        (img: any) => img.images === currentPreview
      );

      setRemovedImages((prev) => [...prev, exist.id]);
    } else {
      // It's a newly added image, remove it from selectedFiles too
      const updatedFiles = selectedImages.filter(
        (_, i) => i !== index - project.images.length
      );
      const updatedLabels = labels.filter((_, i) => i !== index);
      setSelectedImages(updatedFiles);
      setLabels(updatedLabels);
      form.setValue('images', updatedFiles);
      form.setValue('labels', updatedLabels);
    }
    // Remove preview from UI
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    // 🏷️ Remove corresponding label
    setLabels((prev) => {
      const updatedLabels = prev.filter((_, i) => i !== index);
      form.setValue('labels', updatedLabels);
      return updatedLabels;
    });
    setNumberOfPrevImages((prev) => prev - 1);
  };

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
    form.setValue('labels', newLabels);
  };

  const onCreateSubmit = async (data: ProjectFormValues) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('published', data.published.toString());
    formData.append('isFeatured', data.isFeatured.toString());
    formData.append('implementCity', data.implementCity);
    formData.append('categoryId', data.categoryId.toString());

    if (data.coverImage?.[0]) formData.append('coverImage', data.coverImage[0]);
    selectedImages.forEach((file) => formData.append('images', file));
    formData.append('labels', JSON.stringify(labels));

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}project/add-project`,
      {
        method: 'POST',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();
    if (response.statusCode === 201) {
      toast.success(response.message || `Project created successfully!`);
      form.reset();
      setPreviewImages([]);
      setCoverPreview(null);
      redirect('/dashboard/projects?page=1');
    } else {
      toast.error(response.message || '❌ Error saving project');
    }
  };

  const onEditSubmit = async (data: ProjectFormValues) => {
    const cleanLabels = (labels || [])
      .map((l) => l ?? '')
      .slice(numberOfPrevImages, previewImages.length);
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('published', data.published.toString());
    formData.append('isFeatured', data.isFeatured.toString());
    formData.append('implementCity', data.implementCity);
    formData.append('categoryId', data.categoryId.toString());

    if (selectedPreviewFile) formData.append('coverImage', data.coverImage[0]);
    selectedImages.forEach((file) => formData.append('images', file));
    if (cleanLabels.length > 0) {
      cleanLabels.forEach((image, index) =>
        formData.append(`labels[${index}]`, `${cleanLabels[index]}`)
      );
    }
    if (removedImages.length > 0) {
      formData.append('deletedImages', JSON.stringify(removedImages));
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_ADDRESS}project/edit-project/${project.id}`,
      {
        method: 'PUT',
        headers: myHeaders,
        body: formData
      }
    );

    const response = await res.json();
    if (response.statusCode === 200) {
      toast.success(response.message || `Project updated successfully!`);
      revalidateData();
      setRemovedImages([]);
    } else {
      toast.error(response.message || '❌ Error saving project');
    }
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
          className="space-y-6 md:space-y-8"
        >
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Project title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <TinyEditor name="content" control={form.control} label="Content" />

          {/* City */}
          <FormField
            control={form.control}
            name="implementCity"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Implement City</FormLabel>
                <FormControl>
                  <Input placeholder="City name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Select */}
          <FormField
            control={form.control}
            name="categoryId"
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
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? categories.find((c) => c.id === field.value)?.name
                            : 'Select category'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
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

          {/* Switches */}
          <div className="flex flex-col md:flex-row gap-6">
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 w-full">
                  <FormLabel>Published</FormLabel>
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
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 w-full">
                  <FormLabel>Featured</FormLabel>
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

          {/* Cover Image */}
          <FormField
            control={form.control}
            name="coverImage"
            render={() => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => coverRef.current?.click()}
                    >
                      + Add Cover Image
                    </Button>
                    <input
                      ref={coverRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                    {coverPreview && (
                      <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
                        <img
                          src={coverPreview}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gallery Images + Labels */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem>
                <FormLabel>Gallery Images (with labels)</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => imagesRef.current?.click()}
                    >
                      + Add Images
                    </Button>
                    <input
                      ref={imagesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previewImages.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative group border rounded-lg overflow-hidden p-2 flex flex-col items-center"
                          >
                            <img
                              src={src}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            {idx < numberOfPrevImages ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    href="#"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                  >
                                    {labels[idx] || 'empty'}
                                    <span className="sr-only">Settings</span>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  You cant change the previous label
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Input
                                placeholder="Label..."
                                disabled={idx < numberOfPrevImages}
                                value={labels[idx] || ''}
                                onChange={(e) =>
                                  handleLabelChange(idx, e.target.value)
                                }
                                className="mt-2"
                              />
                            )}

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

          {/* Submit */}
          <div className="flex items-center gap-6">
            {action === 'create' && (
              <Button type="submit" className="font-medium">
                Create Project
              </Button>
            )}
            {action === 'edit' && (
              <div className="flex items-center gap-6">
                <Button type="submit" className="font-medium">
                  Edit Project
                </Button>
                <Button
                  onClick={() => setOpenDeleteModal(true)}
                  variant="destructive"
                  type="button"
                  className="font-medium"
                >
                  Delete Project
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </>
  );
}

export default ProjectForm;
