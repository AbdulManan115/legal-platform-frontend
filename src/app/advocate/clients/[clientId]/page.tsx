"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Client {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface ClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
}

interface LegalCase {
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
}

interface CasesResponse {
  success: boolean;
  data: {
    cases: LegalCase[];
  };
}

const statusLabels: Record<LegalCase["status"], string> = {
  active: "Active",
  pending: "Pending",
  closed: "Closed",
  urgent: "Urgent",
};

export default function AdvocateClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const clientId = params.clientId;

  const [client, setClient] = useState<Client | null>(null);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [clientResult, casesResult] = await Promise.all([
          apiFetch<ClientResponse>(`/clients/${clientId}`),
          apiFetch<CasesResponse>(`/cases/for-client/${clientId}`),
        ]);

        setClient(clientResult.data.client);
        setCases(casesResult.data.cases || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load client details.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [clientId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen items-center justify-center text-gray-500">
          <Loader2 size={22} className="mr-2 animate-spin" />
          Loading client...
        </div>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container-main py-10">
          <Link
            href="/advocate/clients"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Back to My Clients
          </Link>

          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error || "Client not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container-main flex h-16 items-center justify-between">
          <Link
            href="/advocate/clients"
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            My Clients
          </Link>

          <Link
            href="/"
            className="text-xl font-bold text-gray-900"
          >
            Legal<span className="text-blue-600">Connect</span>
          </Link>

          <div className="w-20" />
        </div>
      </nav>

      <section className="container-main py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Advocate Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {client.name}
            </h1>

            <p className="mt-2 text-gray-600">
              Client information and associated legal cases.
            </p>
          </div>

          <Link
            href={`/advocate/cases?clientId=${client._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Create New Case
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <UserRound size={23} />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  Client Information
                </h2>
                <p className="text-xs text-gray-500">
                  Contact and personal details
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Phone size={17} className="mt-0.5 shrink-0 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Phone
                  </p>
                  <p className="mt-1 text-gray-800">{client.phone}</p>
                </div>
              </div>

              {client.email && (
                <div className="flex gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Email
                    </p>
                    <p className="mt-1 break-all text-gray-800">
                      {client.email}
                    </p>
                  </div>
                </div>
              )}

              {client.address && (
                <div className="flex gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Address
                    </p>
                    <p className="mt-1 text-gray-800">{client.address}</p>
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Private Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap leading-6 text-gray-700">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <BriefcaseBusiness size={21} className="text-blue-600" />

              <div>
                <h2 className="font-semibold text-gray-900">
                  Legal Cases
                </h2>

                <p className="text-sm text-gray-500">
                  {cases.length}{" "}
                  {cases.length === 1 ? "case" : "cases"} associated with this client.
                </p>
              </div>
            </div>

            {cases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-14 text-center">
                <BriefcaseBusiness
                  size={40}
                  className="mx-auto mb-3 text-gray-300"
                />

                <h3 className="font-semibold text-gray-900">
                  No cases yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Create the first case for this client.
                </p>

                <Link
                  href={`/advocate/cases?clientId=${client._id}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={17} />
                  Create Case
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((item) => (
                  <Link
                    key={item._id}
                    href={`/advocate/cases/${item._id}`}
                    className="block rounded-xl border border-gray-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            {item.caseCode}
                          </span>

                          <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {statusLabels[item.status]}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                          <p>
                            <span className="font-medium text-gray-800">
                              Case Type:
                            </span>{" "}
                            {item.caseType}
                          </p>

                          <p>
                            <span className="font-medium text-gray-800">
                              Court:
                            </span>{" "}
                            {item.court}
                          </p>

                          <p>
                            <span className="font-medium text-gray-800">
                              Case No:
                            </span>{" "}
                            {item.caseNumber || "Not added"}
                          </p>

                          {item.judge && (
                            <p>
                              <span className="font-medium text-gray-800">
                                Judge:
                              </span>{" "}
                              {item.judge}
                            </p>
                          )}

                          {item.oppositeParty && (
                            <p>
                              <span className="font-medium text-gray-800">
                                Opposite Party:
                              </span>{" "}
                              {item.oppositeParty}
                            </p>
                          )}

                          {item.filingDate && (
                            <p>
                              <span className="font-medium text-gray-800">
                                Filing Date:
                              </span>{" "}
                              {new Date(item.filingDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-blue-600">
                        View Case →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
