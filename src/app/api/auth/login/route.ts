import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Prepare form-urlencoded body
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('scope', '');
    params.append('client_id', 'string');
    params.append('client_secret', '********'); // Replace with actual secret if needed

    // Forward credentials to your backend API as form-urlencoded
    const backendRes = await fetch('http://localhost:2010/api/auth/login', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await backendRes.json();

    if (backendRes.ok && data.success) {
      // Set cookie if token is present
      const response = NextResponse.json({ success: true, user: data.user });
      if (data.token) {
        response.cookies.set('token', data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      }
      return response;
    } else {
      // Forward backend status and message
      return NextResponse.json(
        { success: false, ...data },
        { status: backendRes.status }
      );
    }
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
