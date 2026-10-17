"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Scale,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

type ConsultationMode = "online" | "in_person" | "both";

type AdvocateProfile = {
  _id: string;
  slug: string;
  headline?: string;
  bio?: string;
  city: string;
  province: string;
  address?: string;
  publicPhone?: string;
  publicEmail?: string;
  qualification: string;
  experienceYears: number;
  practiceAreas: string[];
  barCouncil?: string;
  licenseNumber?: string;
  consultationFee?: number;
  consultationModes: ConsultationMode[];
  availability?: {
    slotDurationMins: number;
    weekly: {
      day: number;
      enabled: boolean;
      startTime: string;
      endTime: string;
    }[];
    blockedDates: {
      date: string;
      reason?: string;
    }[];
  };
  verification?: {
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  };
};

type ProfileResponse = {
  success: boolean;
  data: {
    profile: AdvocateProfile;
  };
};

type UpdateResponse = {
  success: boolean;
  message: string;
  data: {
    profile: AdvocateProfile;
  };
};

export default function AdvocateProfilePage() {
  const [profile, setProfile] = useState<AdvocateProfile | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [availability, setAvailability] = useState({
    slotDurationMins: 30,
    weekly: Array.from({ length: 7 }, (_, day) => ({
      day,
      enabled: day >= 1 && day <= 5,
      startTime: "09:00",
      endTime: "17:00",
    })),
    blockedDates: [] as { date: string; reason: string }[],
  });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [form, setForm] = useState({
    slug: "",
    headline: "",
    bio: "",
    city: "",
    province: "",
    address: "",
    publicPhone: "",
    publicEmail: "",
    qualification: "",
    experienceYears: "",
    practiceAreas: "",
    barCouncil: "",
    licenseNumber: "",
    consultationFee: "",
    consultationModes: [] as ConsultationMode[],
  });

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const result = await apiFetch<ProfileResponse>(
          "/advocate/profile/me",
          {
            token,
          },
        );

        const data = result.data.profile;

        setProfile(data);

        if (data.availability) {
          setAvailability({
            slotDurationMins:
              data.availability.slotDurationMins || 30,
            weekly:
              data.availability.weekly?.length === 7
                ? data.availability.weekly
                : Array.from({ length: 7 }, (_, day) => ({
                    day,
                    enabled: day >= 1 && day <= 5,
                    startTime: "09:00",
                    endTime: "17:00",
                  })),
            blockedDates:
              data.availability.blockedDates?.map((item) => ({
                date: new Date(item.date)
                  .toISOString()
                  .split("T")[0],
                reason: item.reason || "",
              })) || [],
          });
        }

        setForm({
          slug: data.slug || "",
          headline: data.headline || "",
          bio: data.bio || "",
          city: data.city || "",
          province: data.province || "",
          address: data.address || "",
          publicPhone: data.publicPhone || "",
          publicEmail: data.publicEmail || "",
          qualification: data.qualification || "",
          experienceYears: String(data.experienceYears ?? ""),
          practiceAreas: data.practiceAreas?.join(", ") || "",
          barCouncil: data.barCouncil || "",
          licenseNumber: data.licenseNumber || "",
          consultationFee:
            data.consultationFee !== undefined
              ? String(data.consultationFee)
              : "",
          consultationModes: data.consultationModes || [],
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to load your profile.";

        if (message.toLowerCase().includes("profile not found")) {
          setMode("create");
          setError("");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  function toggleMode(mode: ConsultationMode) {
    setForm((current) => {
      const exists = current.consultationModes.includes(mode);

      return {
        ...current,
        consultationModes: exists
          ? current.consultationModes.filter((item) => item !== mode)
          : [...current.consultationModes, mode],
      };
    });

    setError("");
    setSuccess("");
  }

  async function saveAvailability() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiFetch<{
        success: boolean;
        message: string;
        data: {
          availability: {
            slotDurationMins: number;
            weekly: {
              day: number;
              enabled: boolean;
              startTime: string;
              endTime: string;
            }[];
            blockedDates: {
              date: string;
              reason?: string;
            }[];
          };
        };
      }>("/advocate/availability", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          slotDurationMins: availability.slotDurationMins,
          weekly: availability.weekly,
          blockedDates: availability.blockedDates
            .filter((item) => item.date)
            .map((item) => ({
              date: item.date,
              reason: item.reason.trim() || undefined,
            })),
        }),
      });

      setAvailability({
        slotDurationMins:
          result.data.availability.slotDurationMins,
        weekly: result.data.availability.weekly,
        blockedDates:
          result.data.availability.blockedDates.map((item) => ({
            date: new Date(item.date)
              .toISOString()
              .split("T")[0],
            reason: item.reason || "",
          })),
      });

      setSuccess(
        result.message || "Availability updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update availability.",
      );
    } finally {
      setSaving(false);
    }
  }

  function updateWeeklyDay(
    day: number,
    field: "enabled" | "startTime" | "endTime",
    value: boolean | string,
  ) {
    setAvailability((current) => ({
      ...current,
      weekly: current.weekly.map((item) =>
        item.day === day
          ? { ...item, [field]: value }
          : item,
      ),
    }));
    setError("");
    setSuccess("");
  }

  function addBlockedDate() {
    setAvailability((current) => ({
      ...current,
      blockedDates: [
        ...current.blockedDates,
        { date: "", reason: "" },
      ],
    }));
  }

  function updateBlockedDate(
    index: number,
    field: "date" | "reason",
    value: string,
  ) {
    setAvailability((current) => ({
      ...current,
      blockedDates: current.blockedDates.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item,
      ),
    }));
    setError("");
    setSuccess("");
  }

  function removeBlockedDate(index: number) {
    setAvailability((current) => ({
      ...current,
      blockedDates: current.blockedDates.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (form.consultationModes.length === 0) {
      setError("Please select at least one consultation mode.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await apiFetch<UpdateResponse>(
        mode === "create"
          ? "/advocate/profile"
          : "/advocate/profile/me",
        {
          method: mode === "create" ? "POST" : "PATCH",
          token,
          body: JSON.stringify({
            slug: form.slug.trim(),
            headline: form.headline.trim() || undefined,
            bio: form.bio.trim() || undefined,
            city: form.city.trim(),
            province: form.province.trim(),
            address: form.address.trim() || undefined,
            publicPhone: form.publicPhone.trim() || undefined,
            publicEmail: form.publicEmail.trim() || undefined,
            qualification: form.qualification.trim(),
            experienceYears: Number(form.experienceYears),
            practiceAreas: form.practiceAreas
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            barCouncil: form.barCouncil.trim() || undefined,
            licenseNumber: form.licenseNumber.trim() || undefined,
            consultationFee:
              form.consultationFee.trim() === ""
                ? undefined
                : Number(form.consultationFee),
            consultationModes: form.consultationModes,
          }),
        },
      );

      setProfile(result.data.profile);
      setMode("edit");
      setSuccess(
        result.message ||
          (mode === "create"
            ? "Profile created successfully."
            : "Profile updated successfully."),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-[600px] animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  if (error && !profile && mode !== "create") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load profile
          </h1>

          <p className="mt-3 text-sm text-red-600">{error}</p>

          <Link
            href="/advocate"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const verificationStatus =
    profile?.verification?.status || "pending";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-main flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Scale className="h-5 w-5" />
            </div>

            <span className="font-bold text-slate-900">
              LegalConnect
            </span>
          </Link>

          <Link
            href="/advocate"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="container-main py-10">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Advocate Profile
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Manage your professional profile
          </h1>

          <p className="mt-2 text-slate-500">
            Keep your public advocate information accurate and up to date.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="text-sm font-semibold text-slate-600">
            Verification status:
          </span>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
              verificationStatus === "verified"
                ? "bg-emerald-50 text-emerald-700"
                : verificationStatus === "rejected"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {verificationStatus}
          </span>

          {verificationStatus === "rejected" &&
            profile?.verification?.rejectionReason && (
              <p className="w-full text-sm text-red-600">
                Reason: {profile.verification.rejectionReason}
              </p>
            )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Profile Slug"
                value={form.slug}
                onChange={(value) => updateField("slug", value)}
                placeholder="ali-raza-advocate"
                required
              />

              <Field
                label="Headline"
                value={form.headline}
                onChange={(value) => updateField("headline", value)}
                placeholder="Senior Criminal & Civil Lawyer"
              />

              <Field
                label="City"
                value={form.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Rawalpindi"
                required
              />

              <Field
                label="Province"
                value={form.province}
                onChange={(value) => updateField("province", value)}
                placeholder="Punjab"
                required
              />

              <Field
                label="Qualification"
                value={form.qualification}
                onChange={(value) =>
                  updateField("qualification", value)
                }
                placeholder="LLB"
                required
              />

              <Field
                label="Experience (Years)"
                type="number"
                value={form.experienceYears}
                onChange={(value) =>
                  updateField("experienceYears", value)
                }
                placeholder="6"
                required
              />

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Bio
                </label>

                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    updateField("bio", event.target.value)
                  }
                  rows={5}
                  maxLength={3000}
                  placeholder="Tell clients about your professional experience..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(value) => updateField("address", value)}
                  placeholder="Office address"
                />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Professional Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Bar Council"
                value={form.barCouncil}
                onChange={(value) =>
                  updateField("barCouncil", value)
                }
                placeholder="Punjab Bar Council"
              />

              <Field
                label="License Number"
                value={form.licenseNumber}
                onChange={(value) =>
                  updateField("licenseNumber", value)
                }
                placeholder="License number"
              />

              <Field
                label="Public Phone"
                value={form.publicPhone}
                onChange={(value) =>
                  updateField("publicPhone", value)
                }
                placeholder="03XXXXXXXXX"
              />

              <Field
                label="Public Email"
                type="email"
                value={form.publicEmail}
                onChange={(value) =>
                  updateField("publicEmail", value)
                }
                placeholder="advocate@example.com"
              />

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Practice Areas
                </label>

                <input
                  value={form.practiceAreas}
                  onChange={(event) =>
                    updateField("practiceAreas", event.target.value)
                  }
                  placeholder="Criminal Law, Civil Law, Family Law"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate multiple practice areas with commas.
                </p>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Consultation
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Consultation Fee (PKR)"
                type="number"
                value={form.consultationFee}
                onChange={(value) =>
                  updateField("consultationFee", value)
                }
                placeholder="2500"
              />

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Consultation Modes
                </p>

                <div className="mt-2 flex flex-wrap gap-3">
                  {[
                    ["online", "Online"],
                    ["in_person", "In Person"],
                    ["both", "Both"],
                  ].map(([value, label]) => {
                    const mode = value as ConsultationMode;
                    const selected =
                      form.consultationModes.includes(mode);

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleMode(mode)}
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                          selected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Availability
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set your weekly consultation hours and unavailable dates.
                </p>
              </div>

              <div className="w-full sm:w-44">
                <label className="text-sm font-semibold text-slate-700">
                  Slot Duration
                </label>

                <select
                  value={availability.slotDurationMins}
                  onChange={(event) => {
                    setAvailability((current) => ({
                      ...current,
                      slotDurationMins: Number(event.target.value),
                    }));
                    setError("");
                    setSuccess("");
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                  <option value={180}>180 minutes</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {days.map((dayName, index) => {
                const day =
                  availability.weekly.find(
                    (item) => item.day === index,
                  ) || {
                    day: index,
                    enabled: false,
                    startTime: "09:00",
                    endTime: "17:00",
                  };

                return (
                  <div
                    key={dayName}
                    className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[150px_1fr_1fr]"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(event) =>
                          updateWeeklyDay(
                            index,
                            "enabled",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span className="text-sm font-semibold text-slate-800">
                        {dayName}
                      </span>
                    </label>

                    <input
                      type="time"
                      value={day.startTime}
                      disabled={!day.enabled}
                      onChange={(event) =>
                        updateWeeklyDay(
                          index,
                          "startTime",
                          event.target.value,
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />

                    <input
                      type="time"
                      value={day.endTime}
                      disabled={!day.enabled}
                      onChange={(event) =>
                        updateWeeklyDay(
                          index,
                          "endTime",
                          event.target.value,
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Blocked Dates
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Mark holidays or dates when you cannot accept consultations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addBlockedDate}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  + Add Date
                </button>
              </div>

              {availability.blockedDates.length === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No blocked dates added.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {availability.blockedDates.map((item, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[180px_1fr_auto]"
                    >
                      <input
                        type="date"
                        value={item.date}
                        onChange={(event) =>
                          updateBlockedDate(
                            index,
                            "date",
                            event.target.value,
                          )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                      />

                      <input
                        type="text"
                        value={item.reason}
                        onChange={(event) =>
                          updateBlockedDate(
                            index,
                            "reason",
                            event.target.value,
                          )
                        }
                        maxLength={300}
                        placeholder="Reason (optional)"
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => removeBlockedDate(index)}
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={saveAvailability}
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create Profile"
                  : "Save Profile"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}
