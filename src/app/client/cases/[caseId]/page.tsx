"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Gavel, Scale } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Hearing = {
  _id: string;
  court: string;
  judge?: string;
  dateTime: string;
  status: string;
};

type ClientCase = {
  _id: string;
  caseCode: string;
  caseNumber?: string;
  title: string;
  caseType: string;
  court: string;
  judge?: string;
  oppositeParty?: string;
  description?: string;
  filingDate?: string;
  status: "active" | "pending" | "closed" | "urgent";
  client?: {
    name: string;
  };
  nextHearing?: Hearing | null;
};

const statusClasses: Record<ClientCase["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
  urgent: "bg-red-50 text-red-700",
};

export default function ClientCaseDetailsPage() {
  const params = useParams();
  const caseId = params.caseId as string;

  const [legalCase, setLegalCase] = useState<ClientCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!caseId) return;

    const loadCase = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch<{
          success: boolean;
          data: { case: ClientCase };
        }>(`/cases/client/${caseId}`);

        setLegalCase(response.data.case);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load case details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  const formatDate = (value?: string) => {
    if (!value) return "Not provided";

    return new Date(value).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border bg-white p-8 text-slate-500">
            Loading case details...
          </div>
        </div>
      </main>
    );
  }

  if (error || !legalCase) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/client/cases"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to My Cases
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Case not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/client/cases"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to My Cases
        </Link>

        <div className="mb-6 rounded-2xl bg-slate-900 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-300">
                {legalCase.caseCode}
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                {legalCase.title}
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                {legalCase.caseType}
                {legalCase.caseNumber
                  ? ` • Case No. ${legalCase.caseNumber}`
                  : ""}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusClasses[legalCase.status]}`}
            >
              {legalCase.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-white p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <Scale className="text-slate-700" size={22} />
              <h2 className="text-lg font-semibold text-slate-900">
                Case Information
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Court
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {legalCase.court}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Judge
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {legalCase.judge || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Opposite Party
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {legalCase.oppositeParty || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Filing Date
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatDate(legalCase.filingDate)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <CalendarDays className="text-slate-700" size={22} />
              <h2 className="text-lg font-semibold text-slate-900">
                Next Hearing
              </h2>
            </div>

            {legalCase.nextHearing ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {formatDateTime(legalCase.nextHearing.dateTime)}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {legalCase.nextHearing.court}
                </p>

                {legalCase.nextHearing.judge && (
                  <p className="mt-1 text-sm text-slate-600">
                    Judge: {legalCase.nextHearing.judge}
                  </p>
                )}

                <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  {legalCase.nextHearing.status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No upcoming hearing scheduled.
              </p>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <Gavel className="text-slate-700" size={22} />
            <h2 className="text-lg font-semibold text-slate-900">
              Case Summary
            </h2>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {legalCase.description ||
              "No case summary has been provided yet."}
          </p>
        </section>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm leading-6 text-blue-800">
            This portal provides case status and general case information.
            For legal advice, documents, or detailed case guidance, please
            contact your advocate.
          </p>
        </div>
      </div>
    </main>
  );
}
