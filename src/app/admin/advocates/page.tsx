"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RefreshCw,
  User,
  MapPin,
  BriefcaseBusiness,
  Phone,
  Mail,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type VerificationStatus = "pending" | "verified" | "rejected";

type Advocate = {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  slug: string;
  headline?: string;
  bio?: string;
  city?: string;
  province?: string;
  publicPhone?: string;
  publicEmail?: string;
  qualification?: string;
  experienceYears?: number;
  practiceAreas?: string[];
  barCouncil?: string;
  licenseNumber?: string;
  consultationFee?: number;
  consultationModes?: string[];
  verification?: {
    status: VerificationStatus;
    documents?: Array<{
      name?: string;
      url?: string;
    }>;
    submittedAt?: string;
    rejectionReason?: string;
  };
  ratingAverage?: number;
  ratingCount?: number;
  isListed?: boolean;
};

type ApiResponse = {
  advocates?: Advocate[];
  profiles?: Advocate[];
  data?: Advocate[];
};

export default function AdminAdvocatesPage() {
  const router = useRouter();

  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Advocate | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadAdvocates = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<ApiResponse>("/admin/advocates/pending");

      const list =
        response.advocates ??
        response.profiles ??
        response.data ??
        [];

      setAdvocates(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pending advocates.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getStoredUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    loadAdvocates();
  }, [router]);

  const updateVerification = async (
    advocateId: string,
    status: "verified" | "rejected",
    reason?: string,
  ) => {
    setActionLoading(advocateId);
    setError("");

    try {
      await apiFetch(`/admin/advocates/${advocateId}/verification`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...(status === "rejected" && reason
            ? { rejectionReason: reason }
            : {}),
        }),
      });

      setSelected(null);
      setRejectionReason("");

      await loadAdvocates();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update verification status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} />
              <span className="text-sm font-semibold text-blue-600">
                ADMIN
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Advocate Verification
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and verify advocates before they appear publicly.
            </p>
          </div>

          <button
            onClick={loadAdvocates}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending Verification
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {advocates.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Awaiting Review
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {advocates.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Public Listing
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Only verified advocates
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              Loading pending advocates...
            </div>
          </div>
        ) : advocates.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <ShieldCheck
              size={42}
              className="mx-auto mb-4 text-emerald-500"
            />
            <h2 className="text-lg font-bold text-slate-900">
              No pending advocates
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              All submitted advocate profiles have been reviewed.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Advocate
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Location
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Experience
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Practice Areas
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Submitted
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {advocates.map((advocate) => (
                      <tr
                        key={advocate._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                              <User size={20} />
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {advocate.user?.name || "Unnamed Advocate"}
                              </p>

                              <p className="max-w-[230px] truncate text-sm text-slate-500">
                                {advocate.user?.email ||
                                  advocate.publicEmail ||
                                  "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <MapPin size={15} className="text-slate-400" />
                            {advocate.city || "—"}
                            {advocate.province
                              ? `, ${advocate.province}`
                              : ""}
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <span className="text-sm font-semibold text-slate-700">
                            {advocate.experienceYears ?? 0} years
                          </span>
                        </td>

                        <td className="max-w-[230px] px-5 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {(advocate.practiceAreas || [])
                              .slice(0, 3)
                              .map((area) => (
                                <span
                                  key={area}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                >
                                  {area}
                                </span>
                              ))}

                            {(advocate.practiceAreas || []).length > 3 && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                +
                                {(advocate.practiceAreas || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {formatDate(advocate.verification?.submittedAt)}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelected(advocate)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Review
                              <ChevronDown size={15} />
                            </button>

                            <button
                              onClick={() =>
                                updateVerification(
                                  advocate._id,
                                  "verified",
                                )
                              }
                              disabled={actionLoading === advocate._id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle2 size={15} />
                              Verify
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-4 md:hidden">
              {advocates.map((advocate) => (
                <div
                  key={advocate._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <User size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-slate-900">
                        {advocate.user?.name || "Unnamed Advocate"}
                      </h2>

                      <p className="truncate text-sm text-slate-500">
                        {advocate.user?.email ||
                          advocate.publicEmail ||
                          "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={14} />
                        Location
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {advocate.city || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <BriefcaseBusiness size={14} />
                        Experience
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {advocate.experienceYears ?? 0} years
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Practice Areas
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {(advocate.practiceAreas || []).map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-slate-500">
                    Submitted:{" "}
                    <span className="font-medium text-slate-700">
                      {formatDate(advocate.verification?.submittedAt)}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelected(advocate)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                    >
                      Review
                    </button>

                    <button
                      onClick={() =>
                        updateVerification(advocate._id, "verified")
                      }
                      disabled={actionLoading === advocate._id}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Review Advocate
                </h2>
                <p className="text-sm text-slate-500">
                  Check the submitted information before verification.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelected(null);
                  setRejectionReason("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <XCircle size={22} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Basic info */}
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <User size={25} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selected.user?.name || "Unnamed Advocate"}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {selected.headline || "Advocate"}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Contact
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail size={16} className="text-slate-400" />
                    {selected.user?.email ||
                      selected.publicEmail ||
                      "—"}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone size={16} className="text-slate-400" />
                    {selected.user?.phone ||
                      selected.publicPhone ||
                      "—"}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin size={16} className="text-slate-400" />
                    {selected.city || "—"}
                    {selected.province
                      ? `, ${selected.province}`
                      : ""}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <BriefcaseBusiness size={16} className="text-slate-400" />
                    {selected.experienceYears ?? 0} years experience
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Professional Details
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-400">
                      Qualification
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selected.qualification || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-400">
                      Bar Council
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selected.barCouncil || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-400">
                      License Number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selected.licenseNumber || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xs text-slate-400">
                      Consultation Fee
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selected.consultationFee
                        ? `PKR ${selected.consultationFee}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Practice areas */}
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                  Practice Areas
                </h3>

                <div className="flex flex-wrap gap-2">
                  {(selected.practiceAreas || []).map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {selected.bio && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Bio
                  </h3>
                  <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {selected.bio}
                  </p>
                </div>
              )}

              {/* Documents */}
              {selected.verification?.documents &&
                selected.verification.documents.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                      Verification Documents
                    </h3>

                    <div className="space-y-2">
                      {selected.verification.documents.map(
                        (document, index) => (
                          <div
                            key={`${document.name || "document"}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                          >
                            <span className="text-sm font-medium text-slate-700">
                              {document.name || `Document ${index + 1}`}
                            </span>

                            {document.url && (
                              <a
                                href={document.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold text-blue-600 hover:underline"
                              >
                                View
                              </a>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Rejection reason */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rejection reason
                  <span className="ml-1 font-normal text-slate-400">
                    (only required when rejecting)
                  </span>
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  rows={3}
                  placeholder="Explain why the advocate is being rejected..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setSelected(null);
                  setRejectionReason("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    setError("Please enter a rejection reason.");
                    return;
                  }

                  updateVerification(
                    selected._id,
                    "rejected",
                    rejectionReason.trim(),
                  );
                }}
                disabled={actionLoading === selected._id}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === selected._id ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <XCircle size={17} />
                )}
                Reject
              </button>

              <button
                onClick={() =>
                  updateVerification(selected._id, "verified")
                }
                disabled={actionLoading === selected._id}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading === selected._id ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                Verify Advocate
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
