import { apiFetch } from "@/lib/api";

export type UserRole = "client" | "advocate" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: "active" | "suspended";
  avatarUrl?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
}

export async function loginUser(email: string, password: string) {
  const result = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("accessToken", result.data.accessToken);
  localStorage.setItem("user", JSON.stringify(result.data.user));

  return result.data.user;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  phone: string,
  role: "client" | "advocate",
) {
  const result = await apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      phone,
      role,
    }),
  });

  return result.data.user;
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
}
