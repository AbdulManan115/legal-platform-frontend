const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type ApiOptions = RequestInit & {
  token?: string | null;
  skipRefresh?: boolean;
};

type RefreshResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      role: "client" | "advocate" | "admin";
      status: "active" | "suspended";
    };
  };
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json().catch(() => null)) as RefreshResponse | null;

      if (!response.ok || !data?.data?.accessToken) {
        return null;
      }

      const newToken = data.data.accessToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", newToken);

        if (data.data.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }
      }

      return newToken;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    token,
    skipRefresh = false,
    headers,
    ...requestOptions
  } = options;

  const authToken =
    token ??
    (typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null);

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Content-Type", "application/json");

  if (authToken) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    credentials: "include",
  });

  let data = await response.json().catch(() => null);

  if (
    response.status === 401 &&
    !skipRefresh &&
    path !== "/auth/refresh" &&
    typeof window !== "undefined"
  ) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      const retryHeaders = new Headers(headers);

      retryHeaders.set("Content-Type", "application/json");
      retryHeaders.set("Authorization", `Bearer ${newToken}`);

      response = await fetch(`${API_URL}${path}`, {
        ...requestOptions,
        headers: retryHeaders,
        credentials: "include",
      });

      data = await response.json().catch(() => null);
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`,
    );
  }

  return data as T;
}
