"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Client = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
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
  description?: string;
  filingDate?: string;
  status: "active" | "pending" | "closed" | "urgent";
  importantNotes?: string;
  client: Client;
};

type CasesResponse = {
  success: boolean;
  data: {
    cases: LegalCase[];
  };
};

type ClientsResponse = {
  success: boolean;
  data: {
    clients: Client[];
  };
};

type CaseForm = {
  clientId: string;
  caseNumber: string;
  title: string;
  caseType: string;
  court: string;
  judge: string;
  oppositeParty: string;
  description: string;
  filingDate: string;
  status: "active" | "pending" | "closed" | "urgent";
  importantNotes: string;
};

const emptyForm: CaseForm = {
  clientId: "",
  caseNumber: "",
  title: "",
  caseType: "",
  court: "",
  judge: "",
  oppositeParty: "",
  description: "",
  filingDate: "",
  status: "pending",
  importantNotes: "",
};

const statusLabels: Record<LegalCase["status"], string> = {
  active: "Active",
  pending: "Pending",
  closed: "Closed",
  urgent: "Urgent",
};

export default function AdvocateCasesPage() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null);
  const [form, setForm] = useState<CaseForm>(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [casesResult, clientsResult] = await Promise.all([
        apiFetch<CasesResponse>("/cases/mine"),
        apiFetch<ClientsResponse>("/clients/mine"),
      ]);

      setCases(casesResult.data.cases || []);
      setClients(clientsResult.data.clients || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load cases.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clientModalOpenedRef = useRef(false);

  useEffect(() => {
    const clientId = new URLSearchParams(window.location.search).get(
      "clientId",
    );

    if (
      !clientId ||
      clients.length === 0 ||
      showModal ||
      clientModalOpenedRef.current
    ) {
      return;
    }

    const clientExists = clients.some(
      (client) => client._id === clientId,
    );

    if (!clientExists) return;

    clientModalOpenedRef.current = true;

    setEditingCase(null);
    setForm({
      ...emptyForm,
      clientId,
    });
    setError("");
    setShowModal(true);
  }, [clients, showModal]);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return cases;

    return cases.filter((item) => {
      return (
        item.caseCode.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.caseType.toLowerCase().includes(query) ||
        item.court.toLowerCase().includes(query) ||
        item.client?.name?.toLowerCase().includes(query) ||
        item.client?.phone?.toLowerCase().includes(query)
      );
    });
  }, [cases, search]);

  const openAddModal = () => {
    setEditingCase(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item: LegalCase) => {
    setEditingCase(item);

    setForm({
      clientId: item.client?._id || "",
      caseNumber: item.caseNumber || "",
      title: item.title || "",
      caseType: item.caseType || "",
      court: item.court || "",
      judge: item.judge || "",
      oppositeParty: item.oppositeParty || "",
      description: item.description || "",
      filingDate: item.filingDate
        ? new Date(item.filingDate).toISOString().split("T")[0]
        : "",
      status: item.status,
      importantNotes: item.importantNotes || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingCase(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload: Record<string, unknown> = {
        title: form.title,
        caseType: form.caseType,
        court: form.court,
        status: form.status,
      };

      if (!editingCase) {
        payload.clientId = form.clientId;
      }

      if (form.caseNumber.trim()) payload.caseNumber = form.caseNumber.trim();
      if (form.judge.trim()) payload.judge = form.judge.trim();
      if (form.oppositeParty.trim()) {
        payload.oppositeParty = form.oppositeParty.trim();
      }
      if (form.description.trim()) {
        payload.description = form.description.trim();
      }
      if (form.filingDate) {
        payload.filingDate = form.filingDate;
      }
      if (form.importantNotes.trim()) {
        payload.importantNotes = form.importantNotes.trim();
      }

      if (editingCase) {
        await apiFetch(`/cases/${editingCase._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/cases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save case.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: LegalCase) => {
    const confirmed = window.confirm(
      `Delete case ${item.caseCode} - ${item.title}?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiFetch(`/cases/${item._id}`, {
        method: "DELETE",
      });

      setCases((current) =>
        current.filter((caseItem) => caseItem._id !== item._id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete case.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/advocate"
              className="mb-2 inline-block text-sm text-slate-500 hover:text-slate-900"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              My Cases
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your clients&apos; legal cases.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Case
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by case code, title, client, court..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading cases...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-semibold text-slate-900">
              No cases found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add your first case to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCases.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {item.caseCode}
                      </span>

                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {statusLabels[item.status]}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.title}
                    </h2>

                    <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                      <p>
                        <span className="font-medium">Client:</span>{" "}
                        {item.client?.name || "Unknown"}
                      </p>

                      <p>
                        <span className="font-medium">Case Type:</span>{" "}
                        {item.caseType}
                      </p>

                      <p>
                        <span className="font-medium">Court:</span>{" "}
                        {item.court}
                      </p>

                      <p>
                        <span className="font-medium">Case No:</span>{" "}
                        {item.caseNumber || "Not added"}
                      </p>

                      {item.judge && (
                        <p>
                          <span className="font-medium">Judge:</span>{" "}
                          {item.judge}
                        </p>
                      )}

                      {item.oppositeParty && (
                        <p>
                          <span className="font-medium">Opposite Party:</span>{" "}
                          {item.oppositeParty}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/advocate/cases/${item._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingCase ? "Edit Case" : "Add New Case"}
                </h2>

                {editingCase && (
                  <p className="text-xs text-slate-500">
                    Case Code: {editingCase.caseCode}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {!editingCase && (
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Client *
                    </label>

                    <select
                      required
                      value={form.clientId}
                      disabled={
                        Boolean(
                          new URLSearchParams(window.location.search).get(
                            "clientId",
                          ),
                        )
                      }
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          clientId: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">Select client</option>

                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name} — {client.phone}
                        </option>
                      ))}
                    </select>

                    {clients.length === 0 && (
                      <p className="mt-1.5 text-xs text-amber-600">
                        Add a client first from My Clients.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Case Number
                  </label>

                  <input
                    value={form.caseNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        caseNumber: event.target.value,
                      }))
                    }
                    placeholder="Official court case number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Case Type *
                  </label>

                  <input
                    required
                    value={form.caseType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        caseType: event.target.value,
                      }))
                    }
                    placeholder="e.g. Criminal, Civil, Family"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Case Title *
                  </label>

                  <input
                    required
                    minLength={3}
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Enter case title"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Court *
                  </label>

                  <input
                    required
                    value={form.court}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        court: event.target.value,
                      }))
                    }
                    placeholder="Court name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Judge
                  </label>

                  <input
                    value={form.judge}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        judge: event.target.value,
                      }))
                    }
                    placeholder="Judge name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Opposite Party
                  </label>

                  <input
                    value={form.oppositeParty}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        oppositeParty: event.target.value,
                      }))
                    }
                    placeholder="Opposite party name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Filing Date
                  </label>

                  <input
                    type="date"
                    value={form.filingDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        filingDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Status *
                  </label>

                  <select
                    required
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as CaseForm["status"],
                      }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="urgent">Urgent</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Brief case description"
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Important Notes
                  </label>

                  <textarea
                    rows={3}
                    value={form.importantNotes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        importantNotes: event.target.value,
                      }))
                    }
                    placeholder="Internal notes about this case"
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCase(null);
                    setError("");
                    setForm(emptyForm);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || (!editingCase && clients.length === 0)}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingCase
                      ? "Update Case"
                      : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
