"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MapPin,
  Scale,
  Star,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type {
  AdvocateProfile,
  AdvocateProfileResponse,
} from "@/types/advocate";

interface AdvocatePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function AdvocateProfilePage({
  params,
}: AdvocatePageProps) {
  const [advocate, setAdvocate] = useState<AdvocateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const { slug } = await params;

        const result = await apiFetch<AdvocateProfileResponse>(
          `/advocates/${slug}`,
        );

        setAdvocate(result.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load advocate profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-main py-12">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (error || !advocate) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="container-main py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="font-bold text-red-800">
              Unable to load advocate
            </h1>
            <p className="mt-2 text-sm text-red-700">
              {error || "Advocate profile was not found."}
            </p>
            <Link
              href="/advocates"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft size={16} />
              Back to Advocates
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const rating = advocate.ratingAverage ?? 0;
  const reviewCount = advocate.ratingCount ?? 0;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container-main py-8">
        <Link
          href="/advocates"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Advocates
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-bold text-blue-700">
                  {advocate.user?.name?.charAt(0).toUpperCase() || "A"}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      {advocate.user?.name || "Advocate"}
                    </h1>

                    {advocate.verification?.status === "verified" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        <CheckCircle2 size={14} />
                        Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-slate-600">
                    {advocate.headline || "Legal Advocate"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    {advocate.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {advocate.city}
                        {advocate.province ? `, ${advocate.province}` : ""}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <Star
                        size={16}
                        className="fill-amber-400 text-amber-400"
                      />
                      <strong className="text-slate-700">
                        {rating.toFixed(1)}
                      </strong>
                      ({reviewCount} reviews)
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock3 size={16} />
                      {advocate.experienceYears ?? 0} years experience
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-950">
                About the Advocate
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {advocate.bio ||
                  "Professional legal services focused on helping clients understand and manage their legal matters."}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-950">
                Practice Areas
              </h2>

              <div className="mt-5 flex flex-wrap gap-2">
                {advocate.practiceAreas?.map((area) => (
                  <span
                    key={area}
                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-950">
                Professional Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  label="Qualification"
                  value={advocate.qualification || "Not provided"}
                />
                <InfoItem
                  label="Experience"
                  value={`${advocate.experienceYears ?? 0} years`}
                />
                <InfoItem
                  label="Bar Council"
                  value={advocate.barCouncil || "Not provided"}
                />
                <InfoItem
                  label="Consultation"
                  value={
                    advocate.consultationModes?.length
                      ? advocate.consultationModes
                          .map((mode) =>
                            mode === "in_person"
                              ? "In person"
                              : mode.charAt(0).toUpperCase() + mode.slice(1),
                          )
                          .join(", ")
                      : "Contact advocate"
                  }
                />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <CalendarCheck size={24} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Book a consultation
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose a suitable time and send a consultation request to this
                advocate.
              </p>

              {advocate.consultationFee !== undefined && (
                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Consultation fee
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    PKR {advocate.consultationFee.toLocaleString()}
                  </p>
                </div>
              )}

              <Link
                href={`/book/${advocate._id}`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                <CalendarCheck size={18} />
                View Available Slots
              </Link>

              <div className="mt-5 flex items-start gap-3 border-t border-slate-100 pt-5">
                <Scale size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="text-xs leading-5 text-slate-500">
                  LegalConnect provides a platform for connecting clients with
                  advocates. Consultation and legal advice are provided by the
                  advocate.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
