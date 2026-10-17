"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  MapPin,
  CalendarDays,
  Scale,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Client = {
  name?: string;
};

type LegalCase = {
  _id: string;
  caseCode: string;
  caseNumber?: string;
  title: string;
  caseType: string;
  court: string;
  judge?: string;
  oppositeParty?: string;
  filingDate?: string;
  status: "active" | "pending" | "closed" | "urgent";
  client?: Client;
};

type CasesResponse = {
  success: boolean;
  data: {
    cases: LegalCase[];
  };
};

const statusStyles: Record<LegalCase["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
  urgent: "bg-red-50 text-red-700",
};

export default function ClientCasesPage() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCases = async () => {
      try {
        const result = await apiFetch<CasesResponse>("/cases/client/mine");
        setCases(result.data.cases);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cases.");
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["client"]}>
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/client" className="text-xl font-bold text-slate-950">
            LegalConnect
          </Link>

          <Link
            href="/client"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-700">Client Portal</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            My Cases
          </h1>
          <p className="mt-2 text-slate-500">
            View your linked legal cases, status, court information, and case
            details.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
            <Loader2 className="animate-spin text-blue-700" size={28} />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <FileText className="mx-auto text-slate-300" size={48} />
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              No cases linked yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Your advocate will link your case to your client account when
              your case is added to LegalConnect.
            </p>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {cases.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-blue-700" />
                      <span className="text-sm font-semibold text-blue-700">
                        {item.caseCode}
                      </span>
                    </div>

                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                      {item.title}
                    </h2>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Case Type
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                      <Scale size={15} />
                      {item.caseType}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Court
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                      <MapPin size={15} />
                      {item.court}
                    </div>
                  </div>

                  {item.caseNumber && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Court Case Number
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.caseNumber}
                      </p>
                    </div>
                  )}

                  {item.judge && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Judge
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.judge}
                      </p>
                    </div>
                  )}

                  {item.filingDate && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Filing Date
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                        <CalendarDays size={15} />
                        {new Date(item.filingDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {item.oppositeParty && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Opposite Party
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.oppositeParty}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Case Summary
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your advocate is managing this case through LegalConnect.
                    Contact your advocate for detailed legal advice or case
                    documents.
                  </p>
                </div>

                <Link
                  href={`/client/cases/${item._id}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
    </ProtectedRoute>
  );
}
