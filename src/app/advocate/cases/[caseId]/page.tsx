"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Edit, FileText, Plus, Trash2, Upload, Download, X } from "lucide-react";
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
  createdAt: string;
  updatedAt: string;
};

type HistoryItem = {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
};

type CaseDocument = {
  _id: string;
  category: "fir" | "evidence" | "application" | "court_order" | "agreement" | "other";
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

type DocumentsResponse = {
  success: boolean;
  data: {
    documents: CaseDocument[];
  };
};

type HearingStatus =
  | "scheduled"
  | "completed"
  | "adjourned"
  | "cancelled";

type Hearing = {
  _id: string;
  case: string;
  advocate: string;
  court: string;
  judge?: string;
  dateTime: string;
  notes?: string;
  status: HearingStatus;
  createdAt: string;
  updatedAt: string;
};

type HearingsResponse = {
  success: boolean;
  data: {
    hearings: Hearing[];
  };
};


export default function CaseDetailsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const [caseId, setCaseId] = useState("");
  const [caseData, setCaseData] = useState<LegalCase | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [historyType, setHistoryType] = useState("note_added");
  const [historyText, setHistoryText] = useState("");
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [savingHistory, setSavingHistory] = useState(false);

  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentError, setDocumentError] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentCategory, setDocumentCategory] = useState("other");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [hearingsLoading, setHearingsLoading] = useState(true);
  const [hearingError, setHearingError] = useState("");
  const [showHearingForm, setShowHearingForm] = useState(false);
  const [editingHearingId, setEditingHearingId] = useState<string | null>(null);
  const [savingHearing, setSavingHearing] = useState(false);
  const [hearingCourt, setHearingCourt] = useState("");
  const [hearingJudge, setHearingJudge] = useState("");
  const [hearingDateTime, setHearingDateTime] = useState("");
  const [hearingNotes, setHearingNotes] = useState("");
  const [hearingStatus, setHearingStatus] =
    useState<HearingStatus>("scheduled");

  const loadCase = async (id: string) => {
    try {
      setLoading(true);
      const result = await apiFetch<{
        success: boolean;
        data: { case: LegalCase };
      }>(`/cases/${id}`);
      setCaseData(result.data.case);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (id: string) => {
    try {
      setDocumentsLoading(true);
      setDocumentError("");

      const result = await apiFetch<DocumentsResponse>(
        `/case-documents/case/${id}`,
      );

      setDocuments(result.data.documents);
    } catch (err) {
      setDocumentError(
        err instanceof Error ? err.message : "Failed to load documents",
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  const loadHistory = async (id: string) => {
    try {
      setHistoryLoading(true);
      const result = await apiFetch<{
        success: boolean;
        data: { history: HistoryItem[] };
      }>(`/case-history/${id}`);
      setHistory(result.data.history);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to load history",
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    params.then(({ caseId: id }) => {
      setCaseId(id);
      void loadCase(id);
      void loadHistory(id);
      void loadDocuments(id);
      void loadHearings(id);
    });
  }, [params]);

  const resetHistoryForm = () => {
    setHistoryText("");
    setHistoryType("note_added");
    setEditingHistoryId(null);
    setShowHistoryForm(false);
  };

  const addHistory = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!historyText.trim()) return;

    try {
      setSavingHistory(true);
      setHistoryError("");

      await apiFetch("/case-history", {
        method: "POST",
        body: JSON.stringify({
          caseId,
          type: historyType,
          message: historyText.trim(),
        }),
      });

      resetHistoryForm();
      await loadHistory(caseId);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to add history",
      );
    } finally {
      setSavingHistory(false);
    }
  };

  const startEditHistory = (item: HistoryItem) => {
    setEditingHistoryId(item._id);
    setHistoryType(item.type);
    setHistoryText(item.message);
    setHistoryError("");
    setShowHistoryForm(true);
  };

  const saveHistoryEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingHistoryId || !historyText.trim()) return;

    try {
      setSavingHistory(true);
      setHistoryError("");

      await apiFetch(`/case-history/${editingHistoryId}`, {
        method: "PATCH",
        body: JSON.stringify({
          type: historyType,
          message: historyText.trim(),
        }),
      });

      resetHistoryForm();
      await loadHistory(caseId);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to update history",
      );
    } finally {
      setSavingHistory(false);
    }
  };

  const deleteHistory = async (historyId: string) => {
    if (!window.confirm("Delete this history entry?")) return;

    try {
      setHistoryError("");

      await apiFetch(`/case-history/${historyId}`, {
        method: "DELETE",
      });

      if (editingHistoryId === historyId) {
        resetHistoryForm();
      }

      await loadHistory(caseId);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to delete history",
      );
    }
  };

  const loadHearings = async (id: string) => {
    try {
      setHearingsLoading(true);
      setHearingError("");

      const result = await apiFetch<HearingsResponse>(
        `/hearings/case/${id}`,
      );

      setHearings(result.data.hearings);
    } catch (err) {
      setHearingError(
        err instanceof Error ? err.message : "Failed to load hearings",
      );
    } finally {
      setHearingsLoading(false);
    }
  };

  const resetHearingForm = () => {
    setHearingCourt("");
    setHearingJudge("");
    setHearingDateTime("");
    setHearingNotes("");
    setHearingStatus("scheduled");
    setEditingHearingId(null);
    setShowHearingForm(false);
  };

  const saveHearing = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!hearingCourt.trim() || !hearingDateTime) {
      setHearingError("Court and date/time are required.");
      return;
    }

    try {
      setSavingHearing(true);
      setHearingError("");

      const payload = {
        court: hearingCourt.trim(),
        judge: hearingJudge.trim() || undefined,
        dateTime: new Date(hearingDateTime).toISOString(),
        notes: hearingNotes.trim() || undefined,
        status: hearingStatus,
      };

      if (editingHearingId) {
        await apiFetch(`/hearings/${editingHearingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/hearings", {
          method: "POST",
          body: JSON.stringify({
            caseId,
            ...payload,
          }),
        });
      }

      resetHearingForm();
      await loadHearings(caseId);
    } catch (err) {
      setHearingError(
        err instanceof Error ? err.message : "Failed to save hearing",
      );
    } finally {
      setSavingHearing(false);
    }
  };

  const startEditHearing = (hearing: Hearing) => {
    setEditingHearingId(hearing._id);
    setHearingCourt(hearing.court);
    setHearingJudge(hearing.judge || "");
    setHearingDateTime(
      new Date(hearing.dateTime).toISOString().slice(0, 16),
    );
    setHearingNotes(hearing.notes || "");
    setHearingStatus(hearing.status);
    setHearingError("");
    setShowHearingForm(true);
  };

  const deleteHearing = async (hearingId: string) => {
    if (!window.confirm("Delete this hearing?")) return;

    try {
      setHearingError("");

      await apiFetch(`/hearings/${hearingId}`, {
        method: "DELETE",
      });

      await loadHearings(caseId);
    } catch (err) {
      setHearingError(
        err instanceof Error ? err.message : "Failed to delete hearing",
      );
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile || !caseId) {
      setDocumentError("Please select a file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setDocumentError("File size must be 10 MB or less.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setDocumentError("Only PDF, JPG, PNG and DOCX files are allowed.");
      return;
    }

    try {
      setUploadingDocument(true);
      setDocumentError("");

      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("caseId", caseId);
      formData.append("category", documentCategory);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${apiUrl}/case-documents/upload`, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        credentials: "include",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to upload document");
      }

      setSelectedFile(null);
      setDocumentCategory("other");

      const fileInput = document.getElementById(
        "case-document-file",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadDocuments(caseId);
    } catch (err) {
      setDocumentError(
        err instanceof Error ? err.message : "Failed to upload document",
      );
    } finally {
      setUploadingDocument(false);
    }
  };

  const downloadDocument = async (document: CaseDocument) => {
    try {
      setDocumentError("");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${apiUrl}/case-documents/${document._id}/download`,
        {
          credentials: "include",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to download document");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDocumentError(
        err instanceof Error ? err.message : "Failed to download document",
      );
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      setDocumentError("");

      await apiFetch(`/case-documents/${documentId}`, {
        method: "DELETE",
      });

      await loadDocuments(caseId);
    } catch (err) {
      setDocumentError(
        err instanceof Error ? err.message : "Failed to delete document",
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const deleteCase = async () => {
    if (!caseData) return;

    if (
      !window.confirm(
        `Delete case ${caseData.caseCode}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await apiFetch(`/cases/${caseId}`, {
        method: "DELETE",
      });

      window.location.href = "/advocate/cases";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete case");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-600">Loading case...</p>
        </div>
      </main>
    );
  }

  if (error || !caseData) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/advocate/cases"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600"
          >
            <ArrowLeft size={16} />
            Back to Cases
          </Link>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "Case not found"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/advocate/cases"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Cases
          </Link>

          <div className="flex gap-2">
            <Link
              href="/advocate/cases"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <Edit size={16} />
              Edit
            </Link>

            <button
              type="button"
              onClick={deleteCase}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {caseData.caseCode}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {caseData.title}
              </h1>
              <p className="mt-1 text-slate-600">{caseData.caseType}</p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700">
              {caseData.status}
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <h2 className="mb-3 font-semibold text-slate-900">Client</h2>
              <p className="font-medium">{caseData.client.name}</p>
              <p className="text-sm text-slate-600">
                {caseData.client.phone}
              </p>
              {caseData.client.email && (
                <p className="text-sm text-slate-600">
                  {caseData.client.email}
                </p>
              )}
              {caseData.client.address && (
                <p className="mt-2 text-sm text-slate-600">
                  {caseData.client.address}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <h2 className="mb-3 font-semibold text-slate-900">
                Court Information
              </h2>
              <p className="text-sm">
                <strong>Court:</strong> {caseData.court}
              </p>
              {caseData.caseNumber && (
                <p className="text-sm">
                  <strong>Case No:</strong> {caseData.caseNumber}
                </p>
              )}
              {caseData.judge && (
                <p className="text-sm">
                  <strong>Judge:</strong> {caseData.judge}
                </p>
              )}
              {caseData.oppositeParty && (
                <p className="text-sm">
                  <strong>Opposite Party:</strong> {caseData.oppositeParty}
                </p>
              )}
              {caseData.filingDate && (
                <p className="text-sm">
                  <strong>Filing Date:</strong>{" "}
                  {new Date(caseData.filingDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {caseData.description && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold text-slate-900">
                Description
              </h2>
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {caseData.description}
              </p>
            </div>
          )}

          {caseData.importantNotes && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold text-slate-900">
                Important Notes
              </h2>
              <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {caseData.importantNotes}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hearings</h2>
              <p className="text-sm text-slate-500">
                Manage court hearings for this case.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showHearingForm) {
                  resetHearingForm();
                } else {
                  setHearingError("");
                  setEditingHearingId(null);
                  setShowHearingForm(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Add Hearing
            </button>
          </div>

          {showHearingForm && (
            <form
              onSubmit={saveHearing}
              className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {editingHearingId ? "Edit Hearing" : "Add New Hearing"}
                </h3>

                <button
                  type="button"
                  onClick={resetHearingForm}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Court
                  </label>
                  <input
                    value={hearingCourt}
                    onChange={(e) => setHearingCourt(e.target.value)}
                    required
                    placeholder="Court name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Judge
                  </label>
                  <input
                    value={hearingJudge}
                    onChange={(e) => setHearingJudge(e.target.value)}
                    placeholder="Judge name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={hearingDateTime}
                    onChange={(e) => setHearingDateTime(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>
                  <select
                    value={hearingStatus}
                    onChange={(e) =>
                      setHearingStatus(e.target.value as HearingStatus)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="adjourned">Adjourned</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    Notes
                  </label>
                  <textarea
                    value={hearingNotes}
                    onChange={(e) => setHearingNotes(e.target.value)}
                    rows={3}
                    placeholder="Hearing notes..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetHearingForm}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingHearing}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {savingHearing
                    ? "Saving..."
                    : editingHearingId
                      ? "Update Hearing"
                      : "Save Hearing"}
                </button>
              </div>
            </form>
          )}

          {hearingError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {hearingError}
            </div>
          )}

          {hearingsLoading ? (
            <p className="text-sm text-slate-500">Loading hearings...</p>
          ) : hearings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Calendar className="mx-auto mb-2 text-slate-400" size={24} />
              <p className="font-medium text-slate-700">
                No hearings scheduled
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hearings.map((hearing) => (
                <div
                  key={hearing._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white p-2 text-slate-700">
                        <Calendar size={20} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {new Date(hearing.dateTime).toLocaleString(
                              "en-PK",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                                timeZone: "Asia/Karachi",
                              },
                            )}
                          </h3>

                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                            {hearing.status}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <p>
                            <strong>Court:</strong> {hearing.court}
                          </p>

                          {hearing.judge && (
                            <p>
                              <strong>Judge:</strong> {hearing.judge}
                            </p>
                          )}

                          {hearing.notes && (
                            <p className="whitespace-pre-wrap">
                              <strong>Notes:</strong> {hearing.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditHearing(hearing)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteHearing(hearing._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Case History
              </h2>
              <p className="text-sm text-slate-500">
                Track important updates for this case.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Add History
            </button>
          </div>

          {showHistoryForm && (
            <form
              onSubmit={editingHistoryId ? saveHistoryEdit : addHistory}
              className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {editingHistoryId ? "Edit History" : "Add New History"}
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Type
                  </label>
                  <select
                    value={historyType}
                    onChange={(event) => setHistoryType(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="note_added">Note</option>
                    <option value="created">Filing</option>
                    <option value="hearing_updated">Hearing</option>
                    <option value="updated">Court Order</option>
                    <option value="custom">Update</option>
                    <option value="status_changed">Status Change</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    value={historyText}
                    onChange={(event) => setHistoryText(event.target.value)}
                    rows={3}
                    required
                    placeholder="Write case update..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetHistoryForm}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingHistory}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {savingHistory
                    ? "Saving..."
                    : editingHistoryId
                      ? "Update History"
                      : "Save History"}
                </button>
              </div>
            </form>
          )}

          {historyError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {historyError}
            </div>
          )}

          {historyLoading ? (
            <p className="text-sm text-slate-500">Loading history...</p>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Clock className="mx-auto mb-2 text-slate-400" size={24} />
              <p className="font-medium text-slate-700">
                No history entries yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="relative border-l-2 border-slate-200 pl-5"
                >
                  <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-slate-900" />

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold capitalize text-slate-900">
                        {item.type.replaceAll("_", " ")}
                      </span>

                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditHistory(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteHistory(item._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>

                  {item.createdBy?.name && (
                    <p className="mt-1 text-xs text-slate-400">
                      Added by {item.createdBy.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Case Documents
              </h2>
              <p className="text-sm text-slate-500">
                Upload and manage documents for this case.
              </p>
            </div>
          </div>

          {documentError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {documentError}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  value={documentCategory}
                  onChange={(event) => setDocumentCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="other">Other</option>
                  <option value="fir">FIR</option>
                  <option value="evidence">Evidence</option>
                  <option value="application">Application</option>
                  <option value="court_order">Court Order</option>
                  <option value="agreement">Agreement</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  File
                </label>
                <input
                  id="case-document-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">
                  PDF, JPG, PNG or DOCX — maximum 10 MB
                </p>
              </div>

              <button
                type="button"
                onClick={() => void uploadDocument()}
                disabled={uploadingDocument || !selectedFile}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={16} />
                {uploadingDocument ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {documentsLoading ? (
            <p className="text-sm text-slate-500">Loading documents...</p>
          ) : documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <FileText className="mx-auto mb-2 text-slate-400" size={26} />
              <p className="font-medium text-slate-700">
                No documents uploaded
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document._id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2">
                      <FileText size={20} className="text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {document.originalName}
                      </p>
                      <p className="text-xs capitalize text-slate-500">
                        {document.category.replaceAll("_", " ")} ·{" "}
                        {formatFileSize(document.sizeBytes)} ·{" "}
                        {new Date(document.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => void downloadDocument(document)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Download size={15} />
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteDocument(document._id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
