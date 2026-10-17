"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  UserX,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type UserRole = "client" | "advocate" | "admin";
type UserStatus = "active" | "suspended";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  lastLoginAt?: string;
};

type UsersResponse = {
  success: boolean;
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "20");

      if (role) {
        params.set("role", role);
      }

      if (status) {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await apiFetch<UsersResponse>(
        `/admin/users?${params.toString()}`
      );

      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }, [page, role, status, search]);

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    loadUsers();
  }, [router, loadUsers]);

  const updateStatus = async (
    userId: string,
    nextStatus: UserStatus
  ) => {
    setUpdatingId(userId);
    setError("");

    try {
      await apiFetch(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user status"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const updateRole = async (
    userId: string,
    nextRole: UserRole
  ) => {
    setUpdatingId(userId);
    setError("");

    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: nextRole,
        }),
      });

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user role"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const roleBadge = (userRole: UserRole) => {
    if (userRole === "admin") {
      return "bg-purple-50 text-purple-700";
    }

    if (userRole === "advocate") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const statusBadge = (userStatus: UserStatus) => {
    return userStatus === "active"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-red-50 text-red-700";
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-950">
              Manage Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage platform users, roles and account status.
            </p>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <Users size={21} className="text-slate-700" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Total Results</p>
                <p className="text-2xl font-bold text-slate-950">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <ShieldCheck size={21} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Active</p>
                <p className="text-2xl font-bold text-slate-950">
                  {users.filter((item) => item.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3">
                <UserX size={21} className="text-red-700" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Suspended</p>
                <p className="text-2xl font-bold text-slate-950">
                  {users.filter((item) => item.status === "suspended").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search name, email or phone..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={role}
              onChange={(event) => handleRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="advocate">Advocate</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={status}
              onChange={(event) => handleStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle size={18} />
              {error}
            </div>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-slate-500"
              />
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <UserRound size={40} className="text-slate-300" />
              <h2 className="mt-4 font-semibold text-slate-900">
                No users found
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        User
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Role
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {user.name}
                          </div>

                          <div className="mt-1 text-sm text-slate-500">
                            {user.email}
                          </div>

                          {user.phone && (
                            <div className="mt-1 text-xs text-slate-400">
                              {user.phone}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={user.role}
                            disabled={updatingId === user._id}
                            onChange={(event) =>
                              updateRole(
                                user._id,
                                event.target.value as UserRole
                              )
                            }
                            className={`rounded-lg border-0 px-3 py-2 text-xs font-semibold outline-none ${roleBadge(
                              user.role
                            )}`}
                          >
                            <option value="client">Client</option>
                            <option value="advocate">Advocate</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(
                                "en-PK"
                              )
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            disabled={updatingId === user._id}
                            onClick={() =>
                              updateStatus(
                                user._id,
                                user.status === "active"
                                  ? "suspended"
                                  : "active"
                              )
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                              user.status === "active"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {updatingId === user._id
                              ? "Updating..."
                              : user.status === "active"
                                ? "Suspend"
                                : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {users.map((user) => (
                  <div key={user._id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {user.name}
                        </h3>
                        <p className="mt-1 break-all text-sm text-slate-500">
                          {user.email}
                        </p>

                        {user.phone && (
                          <p className="mt-1 text-xs text-slate-400">
                            {user.phone}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <select
                        value={user.role}
                        disabled={updatingId === user._id}
                        onChange={(event) =>
                          updateRole(
                            user._id,
                            event.target.value as UserRole
                          )
                        }
                        className={`rounded-lg border-0 px-3 py-2 text-xs font-semibold outline-none ${roleBadge(
                          user.role
                        )}`}
                      >
                        <option value="client">Client</option>
                        <option value="advocate">Advocate</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        disabled={updatingId === user._id}
                        onClick={() =>
                          updateStatus(
                            user._id,
                            user.status === "active"
                              ? "suspended"
                              : "active"
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {updatingId === user._id
                          ? "Updating..."
                          : user.status === "active"
                            ? "Suspend"
                            : "Activate"}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      Created:{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(
                            "en-PK"
                          )
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                  <span className="hidden sm:inline">
                    {" "}
                    · {pagination.total} users
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <button
                    disabled={
                      page >= pagination.totalPages || loading
                    }
                    onClick={() => setPage((current) => current + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
