import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import ArticleForm from '../../components/ArticleForm';

const getAllProductCategories = async () => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}article/show-categories-article`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

const getProduct = async (slug: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}article/show-article-admin/${slug}`,
    requestOptions
  );

  const article = await res.json();
  if (article.statusCode === 404) {
    return notFound();
  }
  return article.data;
};

export default async function ProductEditPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const categories = await getAllProductCategories();
  const article = await getProduct(slug);

  async function revalidateData() {
    'use server';

    revalidatePath(`/dashboard/articles/${slug}/edit`);
  }

  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ArticleForm
        categories={categories.articleCategories}
        token={token}
        article={article}
        action="edit"
        revalidateData={revalidateData}
      />
    </div>
  );
}
