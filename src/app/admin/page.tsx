"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserRound,
  Scale,
  CalendarDays,
  BriefcaseBusiness,
  Star,
  ShieldCheck,
  UserCheck,
  UserX,
  FileCheck2,
  MessageSquare,
  BookOpen,
  LogOut,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser, logoutUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

type DashboardStats = {
  users: {
    total: number;
    clients: number;
    advocates: number;
    active: number;
    suspended: number;
  };
  advocates: {
    pendingVerification: number;
    verified: number;
  };
  appointments: number;
  cases: number;
  reviews: number;
};

type DashboardResponse = {
  success: boolean;
  data: DashboardStats;
};

type StatCard = {
  label: string;
  value: number;
  icon: typeof Users;
};

type ManagementCard = {
  href: string;
  title: string;
  description: string;
  icon: typeof Users;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await apiFetch<DashboardResponse>(
          "/admin/dashboard"
        );

        setStats(response.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  const statCards: StatCard[] = stats
    ? [
        {
          label: "Total Users",
          value: stats.users.total,
          icon: Users,
        },
        {
          label: "Clients",
          value: stats.users.clients,
          icon: UserRound,
        },
        {
          label: "Advocates",
          value: stats.users.advocates,
          icon: Scale,
        },
        {
          label: "Appointments",
          value: stats.appointments,
          icon: CalendarDays,
        },
        {
          label: "Cases",
          value: stats.cases,
          icon: BriefcaseBusiness,
        },
        {
          label: "Reviews",
          value: stats.reviews,
          icon: Star,
        },
      ]
    : [];

  const managementCards: ManagementCard[] = [
    {
      href: "/admin/users",
      title: "Manage Users",
      description: "View users, roles, status and account activity.",
      icon: Users,
    },
    {
      href: "/admin/advocates",
      title: "Advocate Verification",
      description: "Review and manage advocate verification requests.",
      icon: FileCheck2,
    },
    {
      href: "/admin/reviews",
      title: "Review Moderation",
      description: "Manage public advocate reviews and visibility.",
      icon: MessageSquare,
    },
    {
      href: "/admin/legal",
      title: "Legal Content",
      description: "Manage legal categories and provisions.",
      icon: BookOpen,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Legal Platform
            </p>
            <h1 className="text-2xl font-bold text-slate-950">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="animate-spin text-slate-500" size={30} />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle size={20} />
              Dashboard Error
            </div>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">
                          {card.label}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-slate-950">
                          {card.value}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-100 p-3">
                        <Icon size={22} className="text-slate-700" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <FileCheck2 size={22} className="text-amber-700" />
                  <div>
                    <p className="text-sm text-amber-700">
                      Pending Verification
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      {stats.advocates.pendingVerification}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-3">
                  <UserCheck size={22} className="text-emerald-700" />
                  <div>
                    <p className="text-sm text-emerald-700">
                      Verified Advocates
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {stats.advocates.verified}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={22} className="text-blue-700" />
                  <div>
                    <p className="text-sm text-blue-700">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.users.active}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-3">
                  <UserX size={22} className="text-red-700" />
                  <div>
                    <p className="text-sm text-red-700">
                      Suspended Users
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.users.suspended}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-950">
                Management
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {managementCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="rounded-xl bg-slate-100 p-3">
                          <Icon size={22} className="text-slate-700" />
                        </div>

                        <ArrowRight
                          size={19}
                          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700"
                        />
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-950">
                        {card.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {card.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
