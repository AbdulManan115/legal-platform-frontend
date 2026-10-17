"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type ReviewStatus = "visible" | "hidden";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  createdAt: string;
  advocate?: {
    _id?: string;
    slug?: string;
    ratingAverage?: number;
    ratingCount?: number;
  };
  client?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  appointment?: {
    _id?: string;
    startAt?: string;
    endAt?: string;
    status?: string;
  };
};

type ReviewsResponse = {
  success: boolean;
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function formatDate(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminReviewsPage() {
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [status, setStatus] = useState<"" | ReviewStatus>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (status) {
        params.set("status", status);
      }

      const result = await apiFetch<ReviewsResponse>(
        `/admin/reviews?${params.toString()}`,
      );

      setReviews(result.reviews || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(Math.max(result.pagination?.totalPages || 1, 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    void loadReviews();
  }, [router, page, status]);

  async function moderateReview(
    reviewId: string,
    nextStatus: ReviewStatus,
  ) {
    try {
      setUpdatingId(reviewId);
      setError("");

      await apiFetch(`/admin/reviews/${reviewId}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });

      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update review",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function changeStatus(value: "" | ReviewStatus) {
    setStatus(value);
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin")}
              className="mb-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              ← Back to Admin
            </button>

            <h1 className="text-2xl font-bold text-slate-900">
              Review Moderation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review advocate feedback and control public visibility.
            </p>
          </div>

          <button
            onClick={() => void loadReviews()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {total} total reviews
            </p>
            <p className="text-xs text-slate-500">
              Moderate reviews before they appear publicly.
            </p>
          </div>

          <select
            value={status}
            onChange={(e) =>
              changeStatus(e.target.value as "" | ReviewStatus)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All reviews</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">No reviews found</p>
            <p className="mt-1 text-sm text-slate-500">
              There are no reviews matching this filter.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Client
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Advocate
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Rating
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Comment
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {review.client?.name || "Unknown client"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {review.client?.email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {review.advocate?.slug || "Unknown advocate"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-slate-900">
                              {review.rating}/5
                            </span>
                          </div>
                        </td>

                        <td className="max-w-[280px] px-5 py-4 text-sm text-slate-600">
                          <p className="line-clamp-2">
                            {review.comment || "No comment"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(review.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              review.status === "visible"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {review.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {review.status === "visible" ? (
                            <button
                              disabled={updatingId === review._id}
                              onClick={() =>
                                void moderateReview(review._id, "hidden")
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              <EyeOff className="h-4 w-4" />
                              {updatingId === review._id
                                ? "Updating..."
                                : "Hide"}
                            </button>
                          ) : (
                            <button
                              disabled={updatingId === review._id}
                              onClick={() =>
                                void moderateReview(review._id, "visible")
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                              {updatingId === review._id
                                ? "Updating..."
                                : "Show"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 md:hidden">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.client?.name || "Unknown client"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {review.client?.email || "—"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        review.status === "visible"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-500">
                      Advocate:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {review.advocate?.slug || "Unknown"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{review.rating}/5</span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {review.comment || "No comment"}
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    {formatDate(review.createdAt)}
                  </p>

                  <button
                    disabled={updatingId === review._id}
                    onClick={() =>
                      void moderateReview(
                        review._id,
                        review.status === "visible" ? "hidden" : "visible",
                      )
                    }
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
                      review.status === "visible"
                        ? "bg-slate-900 hover:bg-slate-800"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {review.status === "visible" ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    {updatingId === review._id
                      ? "Updating..."
                      : review.status === "visible"
                        ? "Hide Review"
                        : "Show Review"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && reviews.length > 0 && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((value) => Math.min(value + 1, totalPages))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
