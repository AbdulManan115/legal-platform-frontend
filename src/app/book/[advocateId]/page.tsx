"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

type Slot = {
  startAt: string;
  endAt: string;
};

type Advocate = {
  id: string;
  slug: string;
  headline?: string;
  city?: string;
  province?: string;
  consultationFee?: number;
  user?: { name: string };
};

type AdvocateResponse = { success: boolean; data: Advocate };
type SlotsResponse = { success: boolean; data: { slots: Slot[] } };
type AppointmentResponse = {
  success: boolean;
  message: string;
  data: { appointment: { id: string; status: string } };
};

export default function BookingPage({
  params,
}: {
  params: Promise<{ advocateId: string }>;
}) {
  const [advocateId, setAdvocateId] = useState("");
  const [advocate, setAdvocate] = useState<Advocate | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    params.then(({ advocateId: id }) => {
      setAdvocateId(id);

      apiFetch<AdvocateResponse>(`/advocates/`)
        .then((result) => setAdvocate(result.data))
        .catch(() => setError("Unable to load advocate information."))
        .finally(() => setLoading(false));
    });
  }, [params]);

  useEffect(() => {
    if (!advocateId) return;

    const loadSlots = async () => {
      setSlotsLoading(true);

      try {
        const result = await apiFetch<SlotsResponse>(`/slots/${advocateId}`);
        setSlots(result.data?.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [advocateId]);

  const handleBooking = async () => {
    if (!selectedSlot) {
      setError("Please select an available slot first.");
      return;
    }

    if (issueDescription.trim().length < 5) {
      setError("Please describe your legal issue in at least 5 characters.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Please log in as a client before booking a consultation.");
      return;
    }

    setBooking(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiFetch<AppointmentResponse>("/appointments", {
        method: "POST",
        token,
        body: JSON.stringify({
          advocateId,
          startAt: selectedSlot.startAt,
          endAt: selectedSlot.endAt,
          issueDescription: issueDescription.trim(),
        }),
      });

      setSuccess(
        result.message || "Appointment request created successfully.",
      );
      setSelectedSlot(null);
      setIssueDescription("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create booking.",
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-8 h-72 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  if (!advocate) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Advocate not found
          </h1>

          <p className="mt-3 text-slate-500">
            We could not load this advocate&apos;s information.
          </p>

          <Link
            href="/advocates"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Advocates
          </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="border-b border-slate-200 bg-white">
        <div className="container-main py-12 sm:py-14">
          <Link
            href={`/advocates/${advocate.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:-translate-x-0.5 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <div className="mt-9">
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-5xl">
              Book a Consultation
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Select an available time and tell the advocate about your legal
              issue.
            </p>
          </div>
        </div>
      </section>

      <section className="container-main py-12 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {advocate.user?.name || "Verified Advocate"}
            </h2>

            <p className="mt-2 text-sm font-semibold text-blue-700">
              {advocate.headline || "Legal Advocate"}
            </p>

            <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                {advocate.city || "Location not available"}
                {advocate.province ? `, ${advocate.province}` : ""}
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-slate-400" />
                Consultation availability
              </div>
            </div>

            {advocate.consultationFee !== undefined && (
              <div className="mt-7 border-t border-slate-200 pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Consultation Fee
                </p>

                <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  PKR {advocate.consultationFee.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Available Slots
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Choose a suitable date and time.
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            {slotsLoading ? (
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-slate-50 p-8 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 font-semibold text-slate-900">
                  No available slots
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  There are currently no available consultation slots.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const start = new Date(slot.startAt);
                    const end = new Date(slot.endAt);
                    const selected =
                      selectedSlot?.startAt === slot.startAt;

                    return (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setError("");
                          setSuccess("");
                        }}
                        className={`rounded-2xl border p-4 text-left shadow-sm transition duration-200 ${
                          selected
                            ? "border-slate-950 bg-slate-950 text-white ring-4 ring-slate-100"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`text-sm font-bold ${selected ? "text-white" : "text-slate-900"}`}>
                              {start.toLocaleDateString("en-PK", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </p>

                            <p className={`mt-2 text-sm ${selected ? "text-slate-300" : "text-slate-600"}`}>
                              {start.toLocaleTimeString("en-PK", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" — "}
                              {end.toLocaleTimeString("en-PK", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          {selected && (
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-slate-200 pt-8">
                  <label
                    htmlFor="issueDescription"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Describe your legal issue
                  </label>

                  <textarea
                    id="issueDescription"
                    value={issueDescription}
                    onChange={(event) => {
                      setIssueDescription(event.target.value);
                      setError("");
                    }}
                    rows={5}
                    maxLength={2000}
                    placeholder="Briefly explain what you need help with..."
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-right text-xs text-slate-400">
                    {issueDescription.length}/2000
                  </p>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-700">
                      {success}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={booking || !selectedSlot}
                    className="mt-6 w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {booking ? "Booking..." : "Book Consultation"}
                  </button>
                </div>
              </>
            )}

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4.5">
              <p className="text-xs leading-5 text-amber-800">
                This consultation platform provides access to advocates and
                general legal information. It does not replace professional
                legal advice.
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>
    </ProtectedRoute>
  );
}
