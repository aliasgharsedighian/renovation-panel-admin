import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import CategoryProjectForm from 'app/dashboard/projects/create-category/components/CategoryProjectForm';

const getProjectCategory = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}project/show-project-category/${id}`,
    requestOptions
  );

  const category = await res.json();
  if (category.statusCode === 404) {
    return notFound();
  }
  return category.data;
};

async function EditProjectCategoryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const category = await getProjectCategory(id);

  async function revalidateData() {
    'use server';

    revalidatePath(`/dashboard/projects/categories/${id}/edit`);
  }

  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Project Category</h1>
      <CategoryProjectForm
        token={token}
        category={category}
        action={'edit'}
        revalidateData={revalidateData}
      />
    </div>
  );
}

export default EditProjectCategoryPage;
