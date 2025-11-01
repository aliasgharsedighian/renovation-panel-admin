import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import ProjectForm from '../../components/ProjectForm';

const getAllProjectCategories = async () => {
  const res = await fetch(
    `${process.env.SERVER_ADDRESS}project/show-all-project-categories`
  );

  const categories = await res.json();
  if (res.status === 200) {
    return categories.data;
  }
};

const getProject = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  };

  const res = await fetch(
    `${process.env.SERVER_ADDRESS}project/show-admin-project/${id}`,
    requestOptions
  );

  const project = await res.json();
  if (project.statusCode === 404) {
    return notFound();
  }
  return project.data;
};

export default async function ProjectEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const categories = await getAllProjectCategories();
  const project = await getProject(id);

  async function revalidateData() {
    'use server';

    revalidatePath(`/dashboard/projects/${id}/edit`);
  }

  return (
    <div className="w-full mx-auto p-2 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
      <ProjectForm
        categories={categories.projectCategories}
        token={token}
        project={project}
        action="edit"
        revalidateData={revalidateData}
      />
    </div>
  );
}
