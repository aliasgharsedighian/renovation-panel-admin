import CategoryProductForm from './components/CategoryProductForm';
import { cookies } from 'next/headers';

export default async function AddCategoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Add Category</h1>

      <CategoryProductForm
        token={token}
        category={null}
        action="create"
        revalidateData={null}
      />
    </div>
  );
}
