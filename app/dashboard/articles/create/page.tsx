import { cookies } from 'next/headers';
import ArticleForm from '../components/ArticleForm';

const getAllArticleCategories = async () => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}article/show-categories-article`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

export default async function AddProductPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const categories = await getAllArticleCategories();
  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Add Article</h1>
      <ArticleForm
        categories={categories.articleCategories}
        token={token}
        article={null}
        action="create"
        revalidateData={null}
      />
    </div>
  );
}
