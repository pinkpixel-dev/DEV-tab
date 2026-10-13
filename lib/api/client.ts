export const API_BASE = 'https://dev.to/api';
const ACCEPT = 'application/vnd.forem.api-v1+json';

export type ApiErrorKind = 'rate-limited' | 'offline' | 'http';

export class ApiError extends Error {
  constructor(
    readonly kind: ApiErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Params = Record<string, string | number | undefined>;

export function buildUrl(path: string, params: Params = {}): string {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 429) {
    throw new ApiError('rate-limited', 'DEV is rate limiting requests right now.', 429);
  }
  if (!res.ok) {
    throw new ApiError('http', `DEV returned ${res.status}.`, res.status);
  }
  return (await res.json()) as T;
}

export async function apiGet<T>(path: string, params?: Params, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), { headers: { Accept: ACCEPT }, signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('offline', "Couldn't reach DEV. Check your connection.");
  }
  return parseResponse<T>(res);
}
