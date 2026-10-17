"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Client {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  linkedUser?: {
    _id: string;
  };
  address?: string;
  notes?: string;
}

interface ClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
  };
}

interface ClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
}

interface AppointmentCandidate {
  appointmentId: string;
  client: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  appointmentDate: string;
}

interface AppointmentCandidatesResponse {
  success: boolean;
  data: {
    clients: AppointmentCandidate[];
  };
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

export default function AdvocateClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointmentCandidates, setAppointmentCandidates] =
    useState<AppointmentCandidate[]>([]);
  const [selectedAppointmentClient, setSelectedAppointmentClient] =
    useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const [clientResult, candidateResult] =
        await Promise.all([
          apiFetch<ClientsResponse>("/clients/mine"),
          apiFetch<AppointmentCandidatesResponse>(
            "/clients/appointment-candidates",
          ),
        ]);

      setClients(clientResult.data.clients || []);
      setAppointmentCandidates(
        candidateResult.data.clients || [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setSelectedAppointmentClient("");
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(client: Client) {
    setEditingId(client._id);

    setForm({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      notes: client.notes || "",
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setSelectedAppointmentClient("");
    setForm(emptyForm);
  }

  function handleAppointmentClientSelect(
    appointmentId: string,
  ) {
    setSelectedAppointmentClient(appointmentId);

    if (!appointmentId) {
      setForm(emptyForm);
      return;
    }

    const selected = appointmentCandidates.find(
      (item) => item.appointmentId === appointmentId,
    );

    if (!selected) return;

    setForm((current) => ({
      ...current,
      name: selected.client.name || "",
      phone: selected.client.phone || "",
      email: selected.client.email || "",
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Client name and phone are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        const result = await apiFetch<ClientResponse>(
          `/clients/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: form.name.trim(),
              phone: form.phone.trim(),
              email: form.email.trim() || undefined,
              address: form.address.trim() || undefined,
              notes: form.notes.trim() || undefined,
            }),
          },
        );

        setClients((current) =>
          current.map((client) =>
            client._id === editingId
              ? result.data.client
              : client,
          ),
        );
      } else if (selectedAppointmentClient) {
        const result = await apiFetch<ClientResponse>(
          `/clients/from-appointment/${selectedAppointmentClient}`,
          {
            method: "POST",
          },
        );

        setClients((current) => [
          result.data.client,
          ...current,
        ]);

        setAppointmentCandidates((current) =>
          current.filter(
            (item) =>
              item.appointmentId !==
              selectedAppointmentClient,
          ),
        );
      } else {
        const result = await apiFetch<ClientResponse>("/clients", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
            address: form.address.trim() || undefined,
            notes: form.notes.trim() || undefined,
          }),
        });

        setClients((current) => [
          result.data.client,
          ...current,
        ]);
      }

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save client.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(client: Client) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.name}?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(client._id);
      setError("");

      await apiFetch(`/clients/${client._id}`, {
        method: "DELETE",
      });

      setClients((current) =>
        current.filter((item) => item._id !== client._id),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete client.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      client.name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container-main flex h-16 items-center justify-between">
          <Link
            href="/advocate"
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            Dashboard
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Advocate Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              My Clients
            </h1>

            <p className="mt-2 text-gray-600">
              Add and manage your clients and their contact information.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Client
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients by name, phone or email..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border bg-white py-20 text-gray-500">
            <Loader2
              size={20}
              className="mr-2 animate-spin"
            />
            Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="rounded-xl border bg-white py-20 text-center shadow-sm">
            <UserRound
              size={44}
              className="mx-auto mb-4 text-gray-300"
            />

            <h2 className="font-semibold text-gray-900">
              {clients.length === 0
                ? "No clients yet"
                : "No clients found"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {clients.length === 0
                ? "Add your first client to get started."
                : "Try a different search."}
            </p>

            {clients.length === 0 && (
              <button
                onClick={openAddForm}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredClients.map((client) => (
              <div
                key={client._id}
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <UserRound size={21} />
                    </div>

                    <Link
                      href={`/advocate/clients/${client._id}`}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-gray-900">
                          {client.name}
                        </h2>

                        <p className="text-sm text-gray-500">
                          {client.phone}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEditForm(client)}
                      title="Edit client"
                      className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      onClick={() => handleDelete(client)}
                      disabled={deletingId === client._id}
                      title="Delete client"
                      className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingId === client._id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <Link
                  href={`/advocate/clients/${client._id}`}
                  className="mt-5 block space-y-2 text-sm text-gray-600"
                >
                  {client.email && (
                    <p>
                      <span className="font-medium text-gray-800">
                        Email:
                      </span>{" "}
                      {client.email}
                    </p>
                  )}

                  {client.address && (
                    <p>
                      <span className="font-medium text-gray-800">
                        Address:
                      </span>{" "}
                      {client.address}
                    </p>
                  )}

                  {client.notes && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Notes
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Client" : "Add Client"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingId
                    ? "Update the client's information."
                    : "Enter the client's information."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              {!editingId && appointmentCandidates.length > 0 && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarDays
                      size={18}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Existing Appointment Client
                      </p>
                      <p className="text-xs text-blue-700">
                        Select a client you already had an appointment with.
                      </p>
                    </div>
                  </div>

                  <select
                    value={selectedAppointmentClient}
                    onChange={(event) =>
                      handleAppointmentClientSelect(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select an appointment client
                    </option>

                    {appointmentCandidates.map((item) => (
                      <option
                        key={item.appointmentId}
                        value={item.appointmentId}
                      >
                        {item.client.name}
                        {item.client.phone
                          ? ` — ${item.client.phone}`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {selectedAppointmentClient && (
                    <p className="mt-2 text-xs text-blue-700">
                      Client information has been filled automatically.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Full Name *
                </label>

                <input
                  required
                  value={form.name}
                  disabled={Boolean(selectedAppointmentClient)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Client full name"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Phone *
                </label>

                <input
                  required
                  value={form.phone}
                  disabled={Boolean(selectedAppointmentClient)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                  placeholder="03XXXXXXXXX"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  disabled={Boolean(selectedAppointmentClient)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                  placeholder="client@example.com"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Address
                </label>

                <input
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address: event.target.value,
                    })
                  }
                  placeholder="Client address"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Notes
                </label>

                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes: event.target.value,
                    })
                  }
                  placeholder="Private notes about this client..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingId ? "Update Client" : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
