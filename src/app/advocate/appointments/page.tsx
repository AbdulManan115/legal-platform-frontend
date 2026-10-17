"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  X,
  Clock,
  User,
  Phone,
  Mail,
  Ban,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "completed";

type Client = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};

type Appointment = {
  _id: string;
  startAt: string;
  endAt: string;
  issueDescription: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  cancelledBy?: string;
  client: Client;
  createdAt: string;
  updatedAt: string;
};

type AppointmentsResponse = {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
};

type MyClient = {
  _id: string;
  linkedUser?: {
    _id: string;
  };
};

type ClientsResponse = {
  success: boolean;
  data: {
    clients: MyClient[];
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

export default function AdvocateAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [myClients, setMyClients] = useState<MyClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | AppointmentStatus
  >("all");

  const [actionLoading, setActionLoading] = useState("");
  const [rejectingAppointment, setRejectingAppointment] =
    useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadAppointments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const user = getStoredUser();

      if (!user || user.role !== "advocate") {
        window.location.href = "/login";
        return;
      }

      const [appointmentResult, clientResult] =
        await Promise.all([
          apiFetch<AppointmentsResponse>(
            "/appointments/advocate/mine",
          ),
          apiFetch<ClientsResponse>("/clients/mine"),
        ]);

      setAppointments(
        appointmentResult.data.appointments || [],
      );

      setMyClients(clientResult.data.clients || []);
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

  const filteredAppointments = useMemo(() => {
    if (activeFilter === "all") {
      return appointments;
    }

    return appointments.filter(
      (appointment) => appointment.status === activeFilter,
    );
  }, [appointments, activeFilter]);

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

  const isMyClient = (appointment: Appointment) => {
    return myClients.some(
      (client) =>
        client.linkedUser?._id === appointment.client._id,
    );
  };

  const addToMyClients = async (appointment: Appointment) => {
    if (
      appointment.status !== "confirmed" &&
      appointment.status !== "completed"
    ) {
      return;
    }

    if (isMyClient(appointment)) {
      return;
    }

    try {
      setActionLoading(appointment._id);

      const result = await apiFetch<{
        success: boolean;
        data: {
          client: MyClient;
        };
      }>(`/clients/from-appointment/${appointment._id}`, {
        method: "POST",
      });

      setMyClients((current) => [
        result.data.client,
        ...current,
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add client.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const runAction = async (
    appointmentId: string,
    action: "confirm" | "complete" | "cancel",
  ) => {
    const messages = {
      confirm: "Confirm this appointment?",
      complete: "Mark this appointment as completed?",
      cancel: "Cancel this appointment?",
    };

    if (!window.confirm(messages[action])) {
      return;
    }

    try {
      setActionLoading(`${action}-${appointmentId}`);
      setError("");

      await apiFetch(`/appointments/${appointmentId}/${action}`, {
        method: "PATCH",
      });

      await loadAppointments(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} appointment`,
      );
    } finally {
      setActionLoading("");
    }
  };

  const rejectAppointment = async () => {
    if (!rejectingAppointment) return;

    try {
      setActionLoading(`reject-${rejectingAppointment._id}`);
      setError("");

      await apiFetch(
        `/appointments/${rejectingAppointment._id}/reject`,
        {
          method: "PATCH",
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim() || undefined,
          }),
        },
      );

      setRejectingAppointment(null);
      setRejectionReason("");

      await loadAppointments(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reject appointment",
      );
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-PK", {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatDateTime = (startAt: string, endAt: string) =>
    `${formatDate(startAt)} · ${formatTime(startAt)} - ${formatTime(endAt)}`;

  const isPast = (appointment: Appointment) =>
    new Date(appointment.endAt).getTime() < Date.now();

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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/advocate"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Appointments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage consultation requests from your clients.
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
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => setActiveFilter("pending")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-amber-300"
          >
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.pending}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("confirmed")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-300"
          >
            <p className="text-sm text-slate-500">Confirmed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.confirmed}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("completed")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-emerald-300"
          >
            <p className="text-sm text-slate-500">Completed</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.completed}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("rejected")}
            className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-red-300"
          >
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {counts.rejected}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter("all")}
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
              onClick={() => setActiveFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                activeFilter === value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
              {" "}
              ({counts[value]})
            </button>
          ))}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CalendarDays
              className="mx-auto mb-3 text-slate-400"
              size={32}
            />
            <h2 className="font-semibold text-slate-800">
              No appointments found
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {activeFilter === "all"
                ? "You do not have any appointment requests yet."
                : `There are no ${activeFilter} appointments.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];
              const pendingAction =
                actionLoading.includes(appointment._id);

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

                        {appointment.status === "confirmed" &&
                          isPast(appointment) && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              Time passed
                            </span>
                          )}
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-slate-100 p-2">
                            <User size={18} className="text-slate-600" />
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Client
                            </p>
                            <p className="font-semibold text-slate-900">
                              {appointment.client.name}
                            </p>

                            {appointment.client.phone && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                                <Phone size={13} />
                                {appointment.client.phone}
                              </p>
                            )}

                            {appointment.client.email && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                                <Mail size={13} />
                                {appointment.client.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-slate-100 p-2">
                            <Clock size={18} className="text-slate-600" />
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Appointment
                            </p>
                            <p className="font-semibold text-slate-900">
                              {formatDateTime(
                                appointment.startAt,
                                appointment.endAt,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                          Client's Issue
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {appointment.issueDescription ||
                            "No issue description provided."}
                        </p>
                      </div>

                      {appointment.rejectionReason && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-red-700">
                            {appointment.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:w-52 lg:justify-end">
                      {(appointment.status === "confirmed" ||
                        appointment.status === "completed") &&
                        (isMyClient(appointment) ? (
                          <span className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                            <CheckCircle2 size={16} />
                            Already a Client ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={pendingAction}
                            onClick={() =>
                              void addToMyClients(appointment)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserPlus size={16} />
                            Add to My Clients
                          </button>
                        ))}

                      {appointment.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={pendingAction}
                            onClick={() =>
                              void runAction(
                                appointment._id,
                                "confirm",
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check size={16} />
                            Confirm
                          </button>

                          <button
                            type="button"
                            disabled={pendingAction}
                            onClick={() => {
                              setRejectingAppointment(appointment);
                              setRejectionReason("");
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {appointment.status === "confirmed" && (
                        <>
                          <button
                            type="button"
                            disabled={pendingAction}
                            onClick={() =>
                              void runAction(
                                appointment._id,
                                "complete",
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                          >
                            <CheckCircle2 size={16} />
                            Complete
                          </button>

                          <button
                            type="button"
                            disabled={pendingAction}
                            onClick={() =>
                              void runAction(
                                appointment._id,
                                "cancel",
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            <Ban size={16} />
                            Cancel
                          </button>
                        </>
                      )}

                      {appointment.status === "pending" && (
                        <button
                          type="button"
                          disabled={pendingAction}
                          onClick={() =>
                            void runAction(
                              appointment._id,
                              "cancel",
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Ban size={16} />
                          Cancel
                        </button>
                      )}

                      {appointment.status === "completed" && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                          <CheckCircle2 size={16} />
                          Completed
                        </span>
                      )}

                      {appointment.status === "rejected" && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                          <XCircle size={16} />
                          Rejected
                        </span>
                      )}

                      {appointment.status === "cancelled" && (
                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600">
                          <Ban size={16} />
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {rejectingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Reject Appointment
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  You can provide a reason for the client.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRejectingAppointment(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <strong>{rejectingAppointment.client.name}</strong>
              {" · "}
              {formatDateTime(
                rejectingAppointment.startAt,
                rejectingAppointment.endAt,
              )}
            </div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Rejection Reason
            </label>

            <textarea
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(event.target.value)
              }
              rows={4}
              placeholder="Optional reason for rejecting this appointment..."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() => setRejectingAppointment(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(actionLoading)}
                onClick={() => void rejectAppointment()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading
                  ? "Rejecting..."
                  : "Reject Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
