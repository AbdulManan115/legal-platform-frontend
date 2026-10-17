"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  User,
  MapPin,
  Star,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

type Advocate = {
  _id: string;
  slug?: string;
  headline?: string;
  city?: string;
  qualification?: string;
  practiceAreas?: string[];
  consultationFee?: number;
  consultationModes?: string[];
  ratingAverage?: number;
  ratingCount?: number;
};

type Appointment = {
  _id: string;
  startAt: string;
  endAt: string;
  issueDescription: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  cancelledBy?: string;
  advocate: Advocate;
  createdAt: string;
  updatedAt: string;
};

type AppointmentsResponse = {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
};

const statusConfig: Record<
  AppointmentStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-200 text-slate-700",
  },
};

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | AppointmentStatus>(
    "all",
  );
  const [cancellingId, setCancellingId] = useState("");

  const loadAppointments = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const user = getStoredUser();

      if (!user || user.role !== "client") {
        window.location.href = "/login";
        return;
      }

      const result = await apiFetch<AppointmentsResponse>(
        "/appointments/client/mine",
      );

      setAppointments(result.data.appointments || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAppointments();
  }, []);

  const counts = useMemo(
    () => ({
      all: appointments.length,
      pending: appointments.filter(
        (item) => item.status === "pending",
      ).length,
      confirmed: appointments.filter(
        (item) => item.status === "confirmed",
      ).length,
      completed: appointments.filter(
        (item) => item.status === "completed",
      ).length,
      rejected: appointments.filter(
        (item) => item.status === "rejected",
      ).length,
      cancelled: appointments.filter(
        (item) => item.status === "cancelled",
      ).length,
    }),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    if (filter === "all") {
      return appointments;
    }

    return appointments.filter(
      (appointment) => appointment.status === filter,
    );
  }, [appointments, filter]);

  const cancelAppointment = async (appointment: Appointment) => {
    if (
      !window.confirm(
        `Cancel your appointment with ${getAdvocateName(
          appointment,
        )}?`,
      )
    ) {
      return;
    }

    try {
      setCancellingId(appointment._id);
      setError("");

      await apiFetch(
        `/appointments/${appointment._id}/cancel`,
        {
          method: "PATCH",
        },
      );

      await loadAppointments(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel appointment",
      );
    } finally {
      setCancellingId("");
    }
  };

  const getAdvocateName = (appointment: Appointment) => {
    if (appointment.advocate?.headline) {
      return appointment.advocate.headline;
    }

    return "Your Advocate";
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-PK", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-PK", {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatAppointmentTime = (
    startAt: string,
    endAt: string,
  ) =>
    `${formatDate(startAt)} · ${formatTime(startAt)} - ${formatTime(
      endAt,
    )}`;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">Loading appointments...</p>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/client"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              My Appointments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your advocate consultation appointments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAppointments(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-amber-300"
          >
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.pending}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("confirmed")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300"
          >
            <p className="text-sm text-slate-500">Confirmed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.confirmed}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("completed")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-300"
          >
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.completed}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("rejected")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-red-300"
          >
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.rejected}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("all")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-400 sm:col-span-2 lg:col-span-1"
          >
            <p className="text-sm text-slate-500">All</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.all}
            </p>
          </button>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["confirmed", "Confirmed"],
              ["completed", "Completed"],
              ["rejected", "Rejected"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === value
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label} ({counts[value]})
            </button>
          ))}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CalendarDays
              className="mx-auto mb-3 text-slate-400"
              size={34}
            />

            <h2 className="font-semibold text-slate-800">
              No appointments found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filter === "all"
                ? "You have not booked any appointments yet."
                : `You have no ${filter} appointments.`}
            </p>

            <Link
              href="/advocates"
              className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Find an Advocate
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];

              return (
                <article
                  key={appointment._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>

                        {appointment.status === "confirmed" && (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                            Appointment confirmed
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <User size={22} className="text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-slate-900">
                            {getAdvocateName(appointment)}
                          </h2>

                          {appointment.advocate?.qualification && (
                            <p className="mt-1 text-sm text-slate-600">
                              {appointment.advocate.qualification}
                            </p>
                          )}

                          {appointment.advocate?.city && (
                            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                              <MapPin size={14} />
                              {appointment.advocate.city}
                            </p>
                          )}

                          {appointment.advocate?.practiceAreas &&
                            appointment.advocate.practiceAreas.length >
                              0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {appointment.advocate.practiceAreas
                                  .slice(0, 4)
                                  .map((area) => (
                                    <span
                                      key={area}
                                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                                    >
                                      {area}
                                    </span>
                                  ))}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                          <CalendarDays
                            size={19}
                            className="mt-0.5 text-slate-600"
                          />
                          <div>
                            <p className="text-xs text-slate-500">
                              Appointment Date
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {formatDate(appointment.startAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                          <Clock
                            size={19}
                            className="mt-0.5 text-slate-600"
                          />
                          <div>
                            <p className="text-xs text-slate-500">
                              Time
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                              {formatTime(appointment.startAt)} -{" "}
                              {formatTime(appointment.endAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Your Issue
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {appointment.issueDescription ||
                            "No issue description provided."}
                        </p>
                      </div>

                      {appointment.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                          <div className="flex items-start gap-2">
                            <XCircle
                              size={18}
                              className="mt-0.5 shrink-0 text-red-600"
                            />
                            <div>
                              <p className="text-sm font-semibold text-red-700">
                                Appointment Rejected
                              </p>
                              <p className="mt-1 text-sm text-red-600">
                                {appointment.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {appointment.status === "completed" && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                          <CheckCircle2 size={18} />
                          This consultation has been completed.
                        </div>
                      )}

                      {appointment.status === "cancelled" && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                          <Ban size={18} />
                          This appointment was cancelled.
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:w-48 lg:justify-end">
                      {appointment.advocate?.slug && (
                        <Link
                          href={`/advocates/${appointment.advocate.slug}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <User size={16} />
                          View Advocate
                        </Link>
                      )}

                      {(appointment.status === "pending" ||
                        appointment.status === "confirmed") && (
                        <button
                          type="button"
                          disabled={cancellingId === appointment._id}
                          onClick={() =>
                            void cancelAppointment(appointment)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X size={16} />
                          {cancellingId === appointment._id
                            ? "Cancelling..."
                            : "Cancel Appointment"}
                        </button>
                      )}

                      {appointment.status === "completed" && (
                        <Link
                          href={`/client/appointments/${appointment._id}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100"
                        >
                          <Star size={16} />
                          Give Review
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      </main>
    </ProtectedRoute>
  );
}
