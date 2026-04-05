import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8000';

function buildBackendUrl(path: string) {
  return `${BACKEND_API_URL.replace(/\/$/, '')}${path}`;
}

async function parseBackendError(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await response.json();
    return body?.detail || body?.error || 'Backend request failed';
  }
  const text = await response.text();
  return text || 'Backend request failed';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('user_id');
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';

  const response = await fetch(buildBackendUrl(`/urls${query}`), {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await parseBackendError(response);
    return NextResponse.json({ detail }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: Request) {
  const payload = await request.json();

  const response = await fetch(buildBackendUrl('/urls'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await parseBackendError(response);
    return NextResponse.json({ detail }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
