import CreateProductForm from './components/CreateProductForm';
import { cookies } from 'next/headers';

const getAllProductCategories = async () => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}shop/show-category-product`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

export default async function AddProductPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const categories = await getAllProductCategories();
  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Add Product</h1>
      <CreateProductForm categories={categories} token={token} />
    </div>
  );
}
