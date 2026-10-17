"use client";

import { Suspense, useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import AdvocateCard from "@/components/advocate-card";
import { apiFetch } from "@/lib/api";
import type {
  AdvocateProfile,
  AdvocateSearchResponse,
} from "@/types/advocate";

function AdvocatesContent() {
  const searchParams = useSearchParams();

  const [advocates, setAdvocates] = useState<AdvocateProfile[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdvocates(
    overridePracticeArea?: string,
  ) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (city.trim()) {
        params.set("city", city.trim());
      }

      const selectedPracticeArea =
        overridePracticeArea !== undefined
          ? overridePracticeArea
          : practiceArea;

      if (selectedPracticeArea.trim()) {
        params.set("practiceArea", selectedPracticeArea.trim());
      }

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
    const initialPracticeArea =
      searchParams.get("practiceArea") || "";

    setPracticeArea(initialPracticeArea);
    loadAdvocates(initialPracticeArea);
  }, [searchParams]);

  function clearFilters() {
    setSearch("");
    setCity("");
    setPracticeArea("");

    window.history.replaceState(
      null,
      "",
      "/advocates",
    );

    loadAdvocates("");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <header className="border-b border-slate-200 bg-white">
        <div className="container-main py-12 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Find legal help
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-5xl">
            Find a verified advocate
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Search advocates by legal practice area, location, and professional
            experience.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
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
                    if (event.key === "Enter") {
                      loadAdvocates();
                    }
                  }}
                  placeholder="Search advocate..."
                  className="h-13 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <input
                value={practiceArea}
                onChange={(event) =>
                  setPracticeArea(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadAdvocates();
                  }
                }}
                placeholder="Practice area"
                className="h-13 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadAdvocates();
                  }
                }}
                placeholder="City"
                className="h-13 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                onClick={() => loadAdvocates()}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-blue-700 hover:shadow-md"
              >
                <SlidersHorizontal size={17} />
                Search
              </button>
            </div>

            {(search || city || practiceArea) && (
              <button
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-950"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="container-main py-12 sm:py-14">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Available advocates
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Finding advocates..."
                : `${advocates.length} advocate${
                    advocates.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && advocates.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <Search
              className="mx-auto text-slate-300"
              size={36}
            />

            <h3 className="mt-4 font-bold text-slate-900">
              No advocates found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No verified advocates are currently available for this
              search or practice area.
            </p>
          </div>
        )}

        {!loading && !error && advocates.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {advocates.map((advocate) => (
              <div className="transition duration-300 hover:-translate-y-1">
                <AdvocateCard
                  key={advocate.id}
                  advocate={advocate}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default function AdvocatesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <section className="container-main py-12 sm:py-14">
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
                />
              ))}
            </div>
          </section>
        </main>
      }
    >
      <AdvocatesContent />
    </Suspense>
  );
}
