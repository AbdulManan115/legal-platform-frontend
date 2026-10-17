"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  User,
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
};

type Appointment = {
  _id: string;
  startAt: string;
  endAt: string;
  issueDescription: string;
  status: AppointmentStatus;
  rejectionReason?: string;
  advocate: Advocate;
};

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  status: "visible" | "hidden";
  createdAt: string;
};

type AppointmentsResponse = {
  success: boolean;
  data: {
    appointments: Appointment[];
  };
};

type ReviewResponse = {
  success: boolean;
  data: Review | null;
};

type CreateReviewResponse = {
  success: boolean;
  message: string;
  data: Review;
};

export default function ClientAppointmentDetailPage() {
  const params = useParams<{ appointmentId: string }>();
  const router = useRouter();
  const appointmentId = params.appointmentId;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const user = getStoredUser();

        if (!user || user.role !== "client") {
          router.replace("/login");
          return;
        }

        const appointmentsResult =
          await apiFetch<AppointmentsResponse>(
            "/appointments/client/mine",
          );

        const found = appointmentsResult.data.appointments.find(
          (item) => item._id === appointmentId,
        );

        if (!found) {
          setError("Appointment not found.");
          return;
        }

        setAppointment(found);

        if (found.status === "completed") {
          const reviewResult =
            await apiFetch<ReviewResponse>(
              `/reviews/appointment/${appointmentId}`,
            );

          setExistingReview(reviewResult.data);

          if (reviewResult.data) {
            setRating(reviewResult.data.rating);
            setComment(reviewResult.data.comment || "");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load appointment",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [appointmentId, router]);

  const submitReview = async () => {
    if (!appointment) return;

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const result = await apiFetch<CreateReviewResponse>(
        "/reviews",
        {
          method: "POST",
          body: JSON.stringify({
            appointmentId: appointment._id,
            rating,
            comment: comment.trim() || undefined,
          }),
        },
      );

      setExistingReview(result.data);
      setSuccess("Your review has been submitted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-PK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-PK", {
      hour: "numeric",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-slate-600">Loading appointment...</p>
        </div>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <AlertCircle
              className="mx-auto mb-3 text-red-500"
              size={34}
            />

            <h1 className="font-bold text-slate-900">
              Appointment not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This appointment could not be found."}
            </p>

            <Link
              href="/client/appointments"
              className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
            >
              Back to Appointments
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const advocateName =
    appointment.advocate?.headline || "Your Advocate";

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/client/appointments"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Appointments
        </Link>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100">
                <User size={25} className="text-slate-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {advocateName}
                </h1>

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
              </div>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
              {appointment.status}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays size={18} />
                <span className="text-xs font-medium">Date</span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatDate(appointment.startAt)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={18} />
                <span className="text-xs font-medium">Time</span>
              </div>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {formatTime(appointment.startAt)} -{" "}
                {formatTime(appointment.endAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your Issue
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {appointment.issueDescription ||
                "No issue description provided."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {success}
          </div>
        )}

        {appointment.status !== "completed" ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Review unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You can submit a review after this appointment has
              been completed by the advocate.
            </p>
          </div>
        ) : existingReview ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Review
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  You have already reviewed this appointment.
                </p>
              </div>

              <CheckCircle2
                className="text-emerald-600"
                size={25}
              />
            </div>

            <div className="mt-5 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={25}
                  className={
                    star <= existingReview.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }
                />
              ))}
            </div>

            {existingReview.comment && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {existingReview.comment}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Review Your Advocate
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              How was your consultation with {advocateName}?
            </p>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Your Rating
              </p>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active =
                    star <= (hoverRating || rating);

                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`Rate ${star} out of 5`}
                      onMouseEnter={() =>
                        setHoverRating(star)
                      }
                      onMouseLeave={() =>
                        setHoverRating(0)
                      }
                      onClick={() => setRating(star)}
                      className="rounded-md p-1 transition hover:scale-110"
                    >
                      <Star
                        size={34}
                        className={
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {rating === 0
                  ? "Select a rating"
                  : `${rating} out of 5 stars`}
              </p>
            </div>

            <div className="mt-6">
              <label
                htmlFor="review-comment"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Comment{" "}
                <span className="font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                maxLength={2000}
                rows={5}
                placeholder="Share your experience with this advocate..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {comment.length}/2000
              </p>
            </div>

            <button
              type="button"
              onClick={() => void submitReview()}
              disabled={submitting || rating === 0}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star size={17} />
              {submitting
                ? "Submitting Review..."
                : "Submit Review"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
