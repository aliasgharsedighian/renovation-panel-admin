import { cookies } from 'next/headers';
import CategoryArticleForm from './components/CategoryArticleForm';

export default async function AddArticleCategoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  return (
    <div className="w-full mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Add Category</h1>

      <CategoryArticleForm
        token={token}
        category={null}
        action="create"
        revalidateData={null}
      />
    </div>
  );
}
