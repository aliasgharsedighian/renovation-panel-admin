import { redirect } from 'next/navigation';

export async function handleLogout(token?: string) {
  try {
    const myHeaders = new Headers();
    if (token) myHeaders.append('Authorization', `Bearer ${token}`);

    // 1️⃣ Tell backend to invalidate the token
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}auth/logout`, {
      method: 'POST',
      headers: myHeaders
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
  }

  try {
    // 2️⃣ Call your internal API to clear the cookie
    const res = await fetch(`/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error('Failed to clear local cookie:', error);
  }

  // 3️⃣ Redirect to login
  redirect('/login');
}
