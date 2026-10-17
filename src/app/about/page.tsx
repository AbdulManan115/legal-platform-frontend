import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  CheckCircle2,
  Gavel,
  Scale,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const values = [
  {
    icon: Scale,
    title: "Access to Legal Help",
    description:
      "We make it easier for people to discover legal professionals according to their specific legal needs.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description:
      "Our platform is designed around verified advocate profiles so users can make informed choices.",
  },
  {
    icon: Search,
    title: "Simple Discovery",
    description:
      "Users can search advocates by practice area, location, experience, ratings, and availability.",
  },
  {
    icon: Users,
    title: "Better Connection",
    description:
      "We create a structured connection between clients and advocates through consultation booking.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
            <Navbar />

      {/* HERO */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              About LegalConnect
            </p>

            <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl">
              Making legal help
              <br />
              <span className="text-slate-400">easier to access.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-400">
              LegalConnect is a digital platform designed to connect people
              with verified advocates and make the process of finding,
              booking, and managing legal services more organized.
            </p>
          </div>
        </div>
      </section>

      {/* PURPOSE */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Our Purpose
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Why does LegalConnect exist?
            </h2>
          </div>

          <div className="space-y-5 text-slate-600">
            <p className="leading-8">
              Finding the right legal professional can often be confusing.
              People may not know which type of advocate they need, where to
              find one, or how to arrange a consultation.
            </p>

            <p className="leading-8">
              LegalConnect aims to simplify this process by bringing advocate
              discovery, professional profiles, consultation booking, and
              legal matter management together in one platform.
            </p>

            <p className="leading-8">
              The platform is built to provide general legal information and
              help users connect with legal professionals. It does not replace
              professional legal advice.
            </p>
          </div>
        </div>
      </section>

      {/* HOW PLATFORM WORKS */}
      <section className="bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              The Platform
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              One place for the legal journey.
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              LegalConnect is designed around three simple steps.
            </p>
          </div>

          <div className="mt-14 grid gap-px border border-slate-200 bg-slate-200 md:grid-cols-3">
            {[
              [
                "01",
                "Find",
                "Search and discover advocates based on your legal requirements.",
              ],
              [
                "02",
                "Book",
                "View availability and request a consultation with an advocate.",
              ],
              [
                "03",
                "Manage",
                "Keep appointments, cases, hearings, and legal information organized.",
              ],
            ].map(([number, title, description]) => (
              <div key={number} className="bg-white p-8 sm:p-10">
                <span className="text-xs font-bold tracking-widest text-slate-400">
                  {number}
                </span>

                <h3 className="mt-10 text-2xl font-bold">{title}</h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              What We Focus On
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Built around trust and simplicity.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="border border-slate-200 p-8 transition hover:border-slate-950 sm:p-10"
                >
                  <div className="flex h-12 w-12 items-center justify-center bg-slate-950 text-white">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-7 text-xl font-bold">{value.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ADVOCATE SIDE */}
      <section className="bg-slate-950 py-24 text-white sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              For Advocates
            </p>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              A professional space to manage your practice.
            </h2>
          </div>

          <div>
            <p className="leading-8 text-slate-400">
              Advocates can create a professional profile, manage
              appointments, maintain client information, organize cases,
              monitor hearings, and keep important legal updates in one
              structured dashboard.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Professional advocate profile",
                "Appointment management",
                "Client and case management",
                "Hearing tracking and reminders",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={17} />
                  {item}
                </div>
              ))}
            </div>

            <a
              href="/register?role=advocate"
              className="mt-9 inline-flex items-center gap-2 bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
            >
              Join as an Advocate
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Gavel className="mx-auto" size={38} strokeWidth={1.5} />

          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Start your legal journey.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
            Find a suitable advocate and take the next step with confidence.
          </p>

          <a
            href="/advocates"
            className="mt-8 inline-flex items-center gap-2 bg-slate-950 px-7 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Find an Advocate
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-950 text-white">
              <Scale size={18} />
            </div>
            <span className="font-bold">LegalConnect</span>
          </a>

          <p className="text-xs text-slate-500">
            © 2026 LegalConnect. General legal information only.
          </p>
        </div>
      </footer>
    </main>
  );
}
