"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = getStoredUser();

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else if (user.role === "advocate") {
        router.replace("/advocate");
      } else {
        router.replace("/client");
      }
      return;
    }

    setChecking(false);
  }, [allowedRoles, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
