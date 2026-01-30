import { NextResponse } from 'next/server';

export function isAuthenticated(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('ADMIN_PASSWORD is not set in environment variables');
    return false;
  }

  // Simple check: Authorization header should strictly equal the password
  // In a real app, use Bearer token format: `Bearer ${token}`
  return authHeader === password;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
