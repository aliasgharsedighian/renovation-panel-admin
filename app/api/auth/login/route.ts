import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Call your backend auth API
  const res = await fetch(`${process.env.SERVER_ADDRESS}auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok)
    return NextResponse.json({ error: data.message }, { status: 401 });

  // Example: set cookie if using JWT
  const response = NextResponse.json({ user: data });
  response.cookies.set('auth-token', data.data.accessToken, {
    httpOnly: true,
    path: '/'
  });
  return response;
}
