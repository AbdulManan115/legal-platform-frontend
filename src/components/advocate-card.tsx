import Link from "next/link";
import { ArrowRight, MapPin, Star, BadgeCheck } from "lucide-react";
import type { AdvocateProfile } from "@/types/advocate";

export default function AdvocateCard({
  advocate,
}: {
  advocate: AdvocateProfile;
}) {
  const name = advocate.user?.name || "Verified Advocate";

  return (
    <article className="card overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{name}</h3>
            <BadgeCheck className="h-5 w-5 text-blue-600" />
          </div>

          <p className="mt-1 text-sm font-medium text-blue-600">
            {advocate.headline || "Legal Advocate"}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
          <Star className="h-4 w-4 fill-current" />
          {advocate.ratingAverage?.toFixed(1) || "New"}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
        <MapPin className="h-4 w-4" />
        <span>
          {advocate.city || "Location not available"}
          {advocate.province ? `, ${advocate.province}` : ""}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {advocate.bio || "Professional legal services and consultation."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {advocate.practiceAreas.slice(0, 3).map((area) => (
          <span
            key={area}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {area}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs text-slate-400">Experience</p>
          <p className="text-sm font-semibold text-slate-800">
            {advocate.experienceYears ?? 0} years
          </p>
        </div>

        <Link
          href={`/advocates/${advocate.slug}`}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          View Profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
