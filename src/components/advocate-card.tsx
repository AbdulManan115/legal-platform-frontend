import Link from "next/link";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import type { AdvocateProfile } from "@/types/advocate";

interface AdvocateCardProps {
  advocate: AdvocateProfile;
}

export default function AdvocateCard({ advocate }: AdvocateCardProps) {
  const rating = advocate.ratingAverage ?? 0;
  const reviewCount = advocate.ratingCount ?? 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-700">
          {advocate.user.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-slate-950">{advocate.user.name}</h2>

            {advocate.verification?.status === "verified" && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                title="Verified advocate"
              >
                <CheckCircle2 size={13} />
                Verified
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
            {advocate.headline || "Legal Advocate"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {advocate.city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {advocate.city}
              </span>
            )}

            <span className="flex items-center gap-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        </div>
      </div>

      {advocate.practiceAreas?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {advocate.practiceAreas.slice(0, 3).map((area) => (
            <span
              key={area}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {area}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Experience</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            {advocate.experienceYears ?? 0} years
          </p>
        </div>

        <Link
          href={`/advocates/${advocate.slug}`}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
