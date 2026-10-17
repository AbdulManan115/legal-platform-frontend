"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  LogOut,
  XCircle,
  Users,
  BriefcaseBusiness,
  Bell,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser, logoutUser, type AuthUser } from "@/lib/auth";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

interface ClientInfo {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface Appointment {
  _id: string;
  startAt: string;
  endAt: string;
  issueDescription?: string;
  status: AppointmentStatus;
  client?: ClientInfo;
}

interface AppointmentsResponse {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
}

export default function AdvocateDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
    loadAppointments();

    apiFetch<{
      success: boolean;
      notifications: Array<{ _id: string; isRead: boolean }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>("/notifications")
      .then((result) => {
        setUnreadNotifications(
          (result.notifications || []).filter(
            (notification) => !notification.isRead,
          ).length,
        );
      })
      .catch(() => {});
  }, []);

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const result =
        await apiFetch<AppointmentsResponse>("/appointments/advocate/mine");

      setAppointments(result.data.appointments || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load appointments.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(
    appointmentId: string,
    action: "confirm" | "reject" | "complete" | "cancel",
  ) {
    try {
      setActionId(appointmentId);
      setError("");

      await apiFetch(`/appointments/${appointmentId}/${action}`, {
        method: "PATCH",
      });

      await loadAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update appointment.",
      );
    } finally {
      setActionId(null);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusClass(status: AppointmentStatus) {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "rejected":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }

  const displayName = mounted ? user?.name || "Advocate" : "Advocate";

  const [appointmentFilter, setAppointmentFilter] = useState<
  "all" | "pending" | "confirmed" | "completed" | "cancelled" | "rejected" | "unread"
>("all");

const [selectedDate, setSelectedDate] = useState("");

const filteredAppointments = [...appointments]
  .sort(
    (a, b) =>
      new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
  )
  .filter((appointment) => {
    if (
      selectedDate &&
      new Date(appointment.startAt).toLocaleDateString("en-CA", {
        timeZone: "Asia/Karachi",
      }) !== selectedDate
    ) {
      return false;
    }

    if (appointmentFilter === "all") return true;

    if (appointmentFilter === "unread") {
      return appointment.status === "pending";
    }

    return appointment.status === appointmentFilter;
  });

const filterCounts = {
  all: appointments.length,
  pending: appointments.filter((a) => a.status === "pending").length,
  confirmed: appointments.filter((a) => a.status === "confirmed").length,
  completed: appointments.filter((a) => a.status === "completed").length,
  cancelled: appointments.filter((a) => a.status === "cancelled").length,
  rejected: appointments.filter((a) => a.status === "rejected").length,
  unread: appointments.filter((a) => a.status === "pending").length,
};

  function renderAppointment(appointment: Appointment) {
    return (
      <div
        key={appointment._id}
        className="rounded-xl border p-5"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-gray-900">
                {appointment.client?.name || "Client"}
              </h3>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                  appointment.status,
                )}`}
              >
                {appointment.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={16} />
                {formatDate(appointment.startAt)}
              </span>

              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {formatTime(appointment.startAt)} -{" "}
                {formatTime(appointment.endAt)}
              </span>
            </div>

            {appointment.client?.phone && (
              <p className="text-sm text-gray-600">
                Phone: {appointment.client.phone}
              </p>
            )}

            {appointment.client?.email && (
              <p className="text-sm text-gray-600">
                Email: {appointment.client.email}
              </p>
            )}

            {appointment.issueDescription && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Legal Issue
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {appointment.issueDescription}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {appointment.status === "pending" && (
              <>
                <button
                  onClick={() =>
                    handleAction(appointment._id, "confirm")
                  }
                  disabled={actionId === appointment._id}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  {actionId === appointment._id
                    ? "Updating..."
                    : "Confirm"}
                </button>

                <button
                  onClick={() =>
                    handleAction(appointment._id, "reject")
                  }
                  disabled={actionId === appointment._id}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            )}

            {appointment.status === "confirmed" && (
              <>
                <button
                  onClick={() =>
                    handleAction(appointment._id, "complete")
                  }
                  disabled={actionId === appointment._id}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  Complete
                </button>

                <button
                  onClick={() =>
                    handleAction(appointment._id, "cancel")
                  }
                  disabled={actionId === appointment._id}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container-main flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900"
          >
            Legal<span className="text-blue-600">Connect</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {displayName}
            </span>

            <Link
              href="/advocate/notifications"
              className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </Link>

            <button
              onClick={logoutUser}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="container-main py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            Advocate Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Welcome, {displayName}
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your appointments and client consultations.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <CalendarDays className="mb-3 text-blue-600" />
            <p className="text-sm text-gray-500">Total Appointments</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {appointments.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <Clock className="mb-3 text-amber-600" />
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {appointments.filter((a) => a.status === "pending").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <CheckCircle2 className="mb-3 text-green-600" />
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {appointments.filter((a) => a.status === "confirmed").length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <Users className="mb-3 text-purple-600" />
            <p className="text-sm text-gray-500">Clients</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {
                new Set(
                  appointments
                    .map((appointment) => appointment.client?._id)
                    .filter(Boolean),
                ).size
              }
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/advocate/profile"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <BriefcaseBusiness className="mb-3 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              Manage Profile
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your professional information.
            </p>
          </Link>

          <Link
            href="/advocate/clients"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <Users className="mb-3 text-purple-600" />
            <h2 className="font-semibold text-gray-900">
              My Clients
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Client management will be available here.
            </p>
          </Link>

          <Link
            href="/advocate"
            className="rounded-xl border bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
          >
            <Bell className="mb-3 text-amber-600" />
            <h2 className="font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View your hearing and booking notifications.
            </p>
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Appointments
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage consultation requests from clients.
              </p>
            </div>

            <button
              onClick={loadAppointments}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
            {(
              [
                ["all", "All"],
                ["pending", "Pending"],
                ["confirmed", "Confirmed"],
                ["completed", "Completed"],
                ["cancelled", "Cancelled"],
                ["rejected", "Rejected"],
                ["unread", "Unread"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setAppointmentFilter(value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  appointmentFilter === value
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
                {filterCounts[value] > 0 && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      appointmentFilter === value
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {filterCounts[value]}
                  </span>
                )}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              />

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="mr-2 animate-spin" size={20} />
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays
                className="mx-auto mb-4 text-gray-400"
                size={40}
              />
              <h3 className="font-semibold text-gray-900">
                No appointments found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try another status or date.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map(renderAppointment)}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
