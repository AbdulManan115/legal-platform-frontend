"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Scale } from "lucide-react";
import Navbar from "@/components/Navbar";

const issues = [
  {
    title: "Criminal Law",
    description: "FIR, arrest, bail, criminal charges and related matters.",
  },
  {
    title: "Family Law",
    description: "Divorce, custody, maintenance, marriage and family disputes.",
  },
  {
    title: "Property Law",
    description: "Property disputes, ownership, possession and inheritance matters.",
  },
  {
    title: "Civil Law",
    description: "Civil disputes, recovery, contracts and general claims.",
  },
  {
    title: "Corporate Law",
    description: "Business agreements, companies and commercial legal matters.",
  },
  {
    title: "Tax Law",
    description: "Tax notices, disputes, filing and other tax-related matters.",
  },
];

export default function LegalCheckerPage() {
  const [selectedIssue, setSelectedIssue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleCheck() {
    if (!selectedIssue) return;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
            <Navbar />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white">
            <Scale size={26} />
          </div>

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
            Legal Issue Checker
          </p>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Understand your legal issue.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Select the area that best matches your situation. We&apos;ll help
            you understand what type of legal matter you may be dealing with
            and help you find a relevant advocate.
          </p>
        </div>
      </section>

      {/* Checker */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-black">
            What is your legal issue about?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Choose one category to continue.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {issues.map((issue) => {
            const selected = selectedIssue === issue.title;

            return (
              <button
                key={issue.title}
                type="button"
                onClick={() => {
                  setSelectedIssue(issue.title);
                  setSubmitted(false);
                }}
                className={`group rounded-2xl border p-6 text-left transition ${
                  selected
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white hover:border-slate-950 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{issue.title}</h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        selected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {issue.description}
                    </p>
                  </div>

                  {selected && <CheckCircle2 size={22} />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!selectedIssue}
            className="flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Check My Issue
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Result */}
        {submitted && selectedIssue && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-8">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Possible Legal Area
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {selectedIssue}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                  Based on the category you selected, you may want to speak
                  with an advocate who practices in {selectedIssue}. This
                  checker provides general information only and does not
                  determine your legal rights, charges, case outcome, or
                  provide legal advice.
                </p>

                <Link
                  href={`/advocates?practiceArea=${encodeURIComponent(
                    selectedIssue,
                  )}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Find {selectedIssue} Advocates
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <p className="text-xs leading-6 text-slate-500">
            <strong>Important:</strong> This tool provides general legal
            information for guidance purposes only. It is not legal advice
            and does not replace consultation with a qualified advocate.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
