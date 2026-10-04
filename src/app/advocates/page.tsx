"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import AdvocateCard from "@/components/advocate-card";
import { apiFetch } from "@/lib/api";
import type {
  AdvocateProfile,
  AdvocateSearchResponse,
} from "@/types/advocate";

export default function AdvocatesPage() {
  const [advocates, setAdvocates] = useState<AdvocateProfile[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdvocates() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (city.trim()) params.set("city", city.trim());
      if (practiceArea.trim()) params.set("practiceArea", practiceArea.trim());

      const query = params.toString();
      const result = await apiFetch<AdvocateSearchResponse>(
        `/advocates${query ? `?${query}` : ""}`,
      );

      setAdvocates(result.data?.advocates || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load advocates right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdvocates();
  }, []);

  function clearFilters() {
    setSearch("");
    setCity("");
    setPracticeArea("");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-main py-10">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
            Find legal help
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Find a verified advocate
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Search advocates by legal practice area, location, and professional
            experience.
          </p>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") loadAdvocates();
                  }}
                  placeholder="Search advocate..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <input
                value={practiceArea}
                onChange={(event) => setPracticeArea(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadAdvocates();
                }}
                placeholder="Practice area"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadAdvocates();
                }}
                placeholder="City"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                onClick={loadAdvocates}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                <SlidersHorizontal size={17} />
                Search
              </button>
            </div>

            {(search || city || practiceArea) && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-700"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="container-main py-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Available advocates</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Finding advocates..."
                : `${advocates.length} advocate${advocates.length === 1 ? "" : "s"} found`}
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && advocates.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <Search className="mx-auto text-slate-300" size={36} />
            <h3 className="mt-4 font-bold text-slate-900">
              No advocates found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or clearing the filters.
            </p>
          </div>
        )}

        {!loading && !error && advocates.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {advocates.map((advocate) => (
              <AdvocateCard key={advocate._id} advocate={advocate} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
