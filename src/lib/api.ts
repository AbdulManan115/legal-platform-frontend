const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type ApiOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Something went wrong");
  }

  return data as T;
}
