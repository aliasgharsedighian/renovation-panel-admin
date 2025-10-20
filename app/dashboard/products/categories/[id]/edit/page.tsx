import CategoryProductForm from 'app/dashboard/products/create-category/components/CategoryProductForm';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const getProductCategory = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/show-category-product/${id}`,
    requestOptions
  );

  const category = await res.json();
  if (category.statusCode === 404) {
    return notFound();
  }
  return category.data;
};

async function EditProductCategoryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const category = await getProductCategory(id);

  async function revalidateData() {
    'use server';

    revalidatePath(`/dashboard/products/categories/${id}/edit`);
  }

  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product Category</h1>
      <CategoryProductForm
        token={token}
        category={category}
        action={'edit'}
        revalidateData={revalidateData}
      />
    </div>
  );
}

export default EditProductCategoryPage;
