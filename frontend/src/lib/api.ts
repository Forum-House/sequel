export type UrlRecord = {
  id: number;
  user_id: number;
  short_code: string;
  original_url: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventRecord = {
  id: number;
  url_id: number | null;
  user_id: number | null;
  event_type: string;
  timestamp: string;
  details: Record<string, unknown>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { detail: text } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data.detail || data.error || `Request failed (${response.status})`);
  }

  return data as T;
}

export async function createShortUrl(input: {
  originalUrl: string;
  userId?: number;
  title?: string;
}) {
  return request<UrlRecord>('/urls', {
    method: 'POST',
    body: JSON.stringify({
      user_id: input.userId ?? 1,
      original_url: input.originalUrl,
      title: input.title,
    }),
  });
}

export async function listUrls(userId?: number) {
  const query = userId ? `?user_id=${encodeURIComponent(String(userId))}` : '';
  return request<UrlRecord[]>(`/urls${query}`);
}

export async function listEvents(filters?: { userId?: number; urlId?: number }) {
  const search = new URLSearchParams();
  if (filters?.userId) {
    search.set('user_id', String(filters.userId));
  }
  if (filters?.urlId) {
    search.set('url_id', String(filters.urlId));
  }

  const query = search.toString() ? `?${search.toString()}` : '';
  return request<EventRecord[]>(`/events${query}`);
}
