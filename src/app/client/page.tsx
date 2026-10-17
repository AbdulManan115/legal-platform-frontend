"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  FileText,
  Bell,
  Search,
  LogOut,
  Clock,
  MapPin,
  XCircle,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser, logoutUser, type AuthUser } from "@/lib/auth";

type Advocate = {
  id?: string;
  _id?: string;
  slug?: string;
  headline?: string;
  city?: string;
  province?: string;
  qualification?: string;
};

type Appointment = {
  _id: string;
  startAt: string;
  endAt: string;
  issueDescription: string;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
  advocate?: Advocate;
};

type AppointmentsResponse = {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
};

export default function ClientDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [reviewingAppointment, setReviewingAppointment] =
    useState<Appointment | null>(null);
  const [reviewedAppointments, setReviewedAppointments] = useState<
    Record<string, number>
  >({});
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());

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

    const loadAppointments = async () => {
      try {
        const result = await apiFetch<AppointmentsResponse>(
          "/appointments/client/mine",
        );

        setAppointments(result.data?.appointments || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your appointments.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCanceling(appointmentId);
    setError("");

    try {
      await apiFetch(`/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the appointment.",
      );
    } finally {
      setCanceling("");
    }
  };

  const openReview = async (appointment: Appointment) => {
    setError("");
    setReviewRating(0);
    setReviewComment("");

    try {
      const result = await apiFetch<{
        success: boolean;
        data: {
          rating?: number;
          comment?: string;
        } | null;
      }>(`/reviews/appointment/${appointment._id}`);

      if (result.data?.rating) {
        setReviewedAppointments((current) => ({
          ...current,
          [appointment._id]: result.data!.rating!,
        }));
        return;
      }
    } catch {
      // No existing review is okay; open the review form.
    }

    setReviewingAppointment(appointment);
  };

  const submitReview = async () => {
    if (!reviewingAppointment || reviewRating < 1) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    setReviewSubmitting(true);
    setError("");

    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: reviewingAppointment._id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });

      setReviewedAppointments((current) => ({
        ...current,
        [reviewingAppointment._id]: reviewRating,
      }));

      setReviewingAppointment(null);
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to submit your review.",
      );
    } finally {
      setReviewSubmitting(false);
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

  const statusClass = (status: Appointment["status"]) => {
    if (status === "confirmed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "rejected" || status === "cancelled") {
      return "bg-red-50 text-red-700";
    }

    if (status === "completed") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  if (!mounted) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={["client"]}>
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-main flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950">
            LegalConnect
          </Link>

          <Link
            href="/client/notifications"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
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
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <section className="container-main py-10">
        <div>
          <p className="text-sm font-semibold text-blue-700">
            Client Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Welcome, {user?.name || "Client"}
          </h1>

          <p className="mt-2 text-slate-500">
            Manage your consultations and legal matters from one place.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/advocates"
            className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Search className="text-blue-700" size={24} />
            <h2 className="mt-4 font-bold text-slate-950">Find Advocate</h2>
            <p className="mt-1 text-sm text-slate-500">
              Search and book a consultation.
            </p>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <CalendarDays className="text-blue-700" size={24} />
            <h2 className="mt-4 font-bold text-slate-950">
              {appointments.length}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Total appointments</p>
          </div>

          <Link
              href="/client/cases"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
            >
              <FileText className="text-blue-700" size={24} />
              <h2 className="mt-4 font-bold text-slate-950">My Cases</h2>
              <p className="mt-1 text-sm text-slate-500">
                View your linked legal cases.
              </p>
            </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Bell className="text-blue-700" size={24} />
            <h2 className="mt-4 font-bold text-slate-950">Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">
              Stay updated about your legal matters.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                My Appointments
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your consultation requests and bookings.
              </p>
            </div>

            <Link
              href="/advocates"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Book New
            </Link>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <CalendarDays
                size={36}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-4 font-bold text-slate-950">
                No appointments yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Find an advocate and book your first consultation.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-950">
                          {appointment.advocate?.headline ||
                            "Legal Consultation"}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={16} />
                          {formatDate(appointment.startAt)}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock size={16} />
                          {formatTime(appointment.startAt)} –{" "}
                          {formatTime(appointment.endAt)}
                        </span>

                        {appointment.advocate?.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={16} />
                            {appointment.advocate.city}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Legal Issue
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {appointment.issueDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {appointment.status === "completed" && (
                        reviewedAppointments[appointment._id] ? (
                          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                            <Star size={16} fill="currentColor" />
                            Reviewed ({reviewedAppointments[appointment._id]}/5)
                          </div>
                        ) : (
                          <button
                            onClick={() => openReview(appointment)}
                            className="flex items-center gap-2 rounded-lg border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            <Star size={16} />
                            Give Review
                          </button>
                        )
                      )}

                      {(appointment.status === "pending" ||
                        appointment.status === "confirmed") && (
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          disabled={canceling === appointment._id}
                          className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          {canceling === appointment._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {reviewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Rate Your Consultation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share your experience with this advocate.
                </p>
              </div>

              <button
                onClick={() => setReviewingAppointment(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="Close review"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-700">
                Your rating
              </p>

              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <Star
                      size={32}
                      className={
                        star <= reviewRating
                          ? "text-amber-400"
                          : "text-slate-300"
                      }
                      fill={
                        star <= reviewRating ? "currentColor" : "none"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">
                Comment <span className="font-normal text-slate-400">(optional)</span>
              </label>

              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="How was your consultation?"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {reviewComment.length}/2000
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setReviewingAppointment(null)}
                disabled={reviewSubmitting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={submitReview}
                disabled={reviewSubmitting || reviewRating === 0}
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
    </ProtectedRoute>
  );
}
