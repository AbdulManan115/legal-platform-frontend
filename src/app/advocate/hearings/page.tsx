"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

type LegalCase = {
  _id: string;
  caseCode: string;
  caseNumber?: string;
  title: string;
  caseType: string;
  court: string;
};

type Hearing = {
  _id: string;
  case: string | {
    _id: string;
    caseCode: string;
    caseNumber?: string;
    title: string;
  };
  court: string;
  judge?: string;
  dateTime: string;
  notes?: string;
  status: "scheduled" | "completed" | "adjourned" | "cancelled";
};

type CasesResponse = {
  success: boolean;
  data: {
    cases: LegalCase[];
  };
};

type HearingsResponse = {
  success: boolean;
  data: {
    hearings: Hearing[];
  };
};

const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "adjourned", label: "Adjourned" },
  { value: "cancelled", label: "Cancelled" },
];

const getLocalDateTimeValue = (dateTime?: string) => {
  if (!dateTime) return "";

  const date = new Date(dateTime);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
};

const getCaseId = (hearing: Hearing) =>
  typeof hearing.case === "string"
    ? hearing.case
    : hearing.case?._id || "";

const getCaseLabel = (hearing: Hearing) => {
  if (!hearing.case) return "Case unavailable";

  if (typeof hearing.case === "string") {
    return hearing.case;
  }

  return `${hearing.case.caseCode} — ${hearing.case.title}`;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const emptyForm = {
  caseId: "",
  court: "",
  judge: "",
  dateTime: "",
  notes: "",
  status: "scheduled",
};

export default function HearingsPage() {
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [casesResult, hearingsResult] = await Promise.all([
        apiFetch<CasesResponse>("/cases/mine"),
        apiFetch<HearingsResponse>("/hearings/upcoming"),
      ]);

      setCases(casesResult.data.cases);
      setHearings(hearingsResult.data.hearings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load hearings",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      caseId: cases[0]?._id || "",
    });
    setError("");
    setShowForm(true);
  };

  const openEdit = (hearing: Hearing) => {
    setEditingId(hearing._id);
    setForm({
      caseId: getCaseId(hearing),
      court: hearing.court,
      judge: hearing.judge || "",
      dateTime: getLocalDateTimeValue(hearing.dateTime),
      notes: hearing.notes || "",
      status: hearing.status,
    });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveHearing = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.caseId || !form.court.trim() || !form.dateTime) {
      setError("Case, court and date/time are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await apiFetch(`/hearings/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({
            court: form.court.trim(),
            judge: form.judge.trim() || undefined,
            dateTime: new Date(form.dateTime).toISOString(),
            notes: form.notes.trim() || undefined,
            status: form.status,
          }),
        });
      } else {
        await apiFetch("/hearings", {
          method: "POST",
          body: JSON.stringify({
            caseId: form.caseId,
            court: form.court.trim(),
            judge: form.judge.trim() || undefined,
            dateTime: new Date(form.dateTime).toISOString(),
            notes: form.notes.trim() || undefined,
            status: form.status,
          }),
        });
      }

      closeForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save hearing",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteHearing = async (id: string) => {
    if (!window.confirm("Delete this hearing?")) return;

    try {
      setError("");

      await apiFetch(`/hearings/${id}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete hearing",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/advocate"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              Hearings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage upcoming court hearings for your cases.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            disabled={cases.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            Add Hearing
          </button>
        </div>

        {cases.length === 0 && !loading && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Create a case first before adding a hearing.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
            Loading hearings...
          </div>
        ) : hearings.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-10 text-center">
            <CalendarDays
              className="mx-auto mb-3 text-slate-400"
              size={30}
            />
            <h2 className="font-semibold text-slate-800">
              No upcoming hearings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a hearing to start tracking court dates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hearings.map((hearing) => (
              <div
                key={hearing._id}
                className="rounded-xl border bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {hearing.status}
                      </span>

                      <span className="text-xs text-slate-500">
                        {getCaseLabel(hearing)}
                      </span>
                    </div>

                    <h2 className="font-semibold text-slate-900">
                      {hearing.court}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      <strong>Date:</strong>{" "}
                      {formatDateTime(hearing.dateTime)}
                    </p>

                    {hearing.judge && (
                      <p className="mt-1 text-sm text-slate-600">
                        <strong>Judge:</strong> {hearing.judge}
                      </p>
                    )}

                    {hearing.notes && (
                      <p className="mt-3 text-sm text-slate-600">
                        <strong>Notes:</strong> {hearing.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(hearing)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteHearing(hearing._id)}
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

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingId ? "Edit Hearing" : "Add Hearing"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the court hearing information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={saveHearing} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Case
                  </label>
                  <select
                    value={form.caseId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        caseId: event.target.value,
                      }))
                    }
                    disabled={Boolean(editingId)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100"
                  >
                    <option value="">Select case</option>
                    {cases.map((legalCase) => (
                      <option key={legalCase._id} value={legalCase._id}>
                        {legalCase.caseCode} — {legalCase.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Court *
                  </label>
                  <input
                    value={form.court}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        court: event.target.value,
                      }))
                    }
                    placeholder="e.g. District & Sessions Court Rawalpindi"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
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
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.dateTime}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          dateTime: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Any important hearing notes..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Hearing"
                        : "Save Hearing"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
