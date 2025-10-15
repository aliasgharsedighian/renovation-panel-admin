import { cookies } from 'next/headers';
import ProductForm from '../../components/ProductForm';
import { revalidatePath } from 'next/cache';

const getAllProductCategories = async () => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/show-category-product`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

const getProduct = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/show-admin-product/${id}`,
    requestOptions
  );
  const product = await res.json();
  return product.data;
};

export default async function ProductEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const categories = await getAllProductCategories();
  const product = await getProduct(id);

  async function revalidateData() {
    'use server';

    revalidatePath(`/dashboard/products/${id}/edit`);
  }

  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ProductForm
        categories={categories.productCategories}
        token={token}
        product={product}
        action="edit"
        revalidateData={revalidateData}
      />
    </div>
  );
}
