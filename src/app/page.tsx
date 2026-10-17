import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Gavel,
  Scale,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Search,
    number: "01",
    title: "Find an Advocate",
    description:
      "Discover verified advocates by practice area, location, experience, ratings, and availability.",
  },
  {
    icon: CalendarCheck,
    number: "02",
    title: "Book a Consultation",
    description:
      "Choose a suitable time and request a consultation directly with your selected advocate.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Manage Your Matter",
    description:
      "Keep appointments, cases, hearings, documents, and important updates organized.",
  },
];

const practiceAreas = [
  "Criminal Law",
  "Family Law",
  "Property Law",
  "Corporate Law",
  "Civil Law",
  "Tax Law",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-slate-950 text-white sm:min-h-[calc(100vh-5rem)]">
        {/* Fixed Advocate Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1800&q=90"
            alt=""
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />

          {/* Dark cinematic overlay */}
          <div className="absolute inset-0 bg-black/55" />

          {/* Left side readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25" />

          {/* Bottom cinematic fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

          {/* Large Justice Scales Watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Scale
              size={620}
              strokeWidth={0.45}
              className="text-white/[0.08]"
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-5 py-20 sm:px-8 sm:py-24">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-3 border border-white/20 bg-black/30 px-4 py-2.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 bg-white" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Professional Legal Platform
              </span>
            </div>

            <h1 className="max-w-4xl text-[3.25rem] font-semibold leading-[0.94] tracking-[-0.045em] sm:text-7xl lg:text-[88px]">
              Find.
              <br />
              Book.
              <br />
              <span className="text-slate-400">Manage.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
              Connect with verified advocates, book consultations, and manage
              your legal matters through one professional and secure platform.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href="/advocates"
                className="inline-flex items-center justify-center gap-2 bg-white px-7 py-4 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
              >
                Find an Advocate
                <ArrowRight size={18} />
              </a>

              <a
                href="/legal-checker"
                className="inline-flex items-center justify-center gap-2 border border-white/25 bg-black/20 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Check Legal Issue
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Verified advocates
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Easy consultation booking
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Organized legal matters
              </span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-slate-400 sm:flex">
          <span>Scroll to explore</span>
          <div className="h-10 w-px bg-gradient-to-b from-white/60 to-transparent" />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="flex items-center gap-4 py-7 sm:px-8 sm:first:pl-0">
            <Users size={23} strokeWidth={1.7} />
            <div>
              <p className="font-bold">Professional Network</p>
              <p className="text-xs text-slate-500">
                Connect with legal professionals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-7 sm:px-8">
            <Gavel size={23} strokeWidth={1.7} />
            <div>
              <p className="font-bold">Multiple Practice Areas</p>
              <p className="text-xs text-slate-500">
                Find help for different legal matters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-7 sm:px-8 sm:pr-0">
            <ShieldCheck size={23} strokeWidth={1.7} />
            <div>
              <p className="font-bold">Secure Platform</p>
              <p className="text-xs text-slate-500">
                Your information stays organized
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-slate-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              What we offer
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Everything starts with the right legal professional.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              LegalConnect brings discovery, consultation, and legal matter
              management together in one streamlined experience.
            </p>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <a
                  key={feature.number}
                  href={
                    feature.number === "01"
                      ? "/advocates"
                      : feature.number === "02"
                        ? "/advocates"
                        : "/advocate"
                  }
                  className="group block bg-white p-8 transition duration-300 hover:-translate-y-1 hover:bg-slate-950 hover:text-white sm:p-10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center border border-slate-200 group-hover:border-white/20">
                      <Icon size={22} strokeWidth={1.7} />
                    </div>

                    <span className="text-xs font-bold tracking-widest text-slate-400 group-hover:text-slate-500">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-12 text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 group-hover:text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
                    Learn more
                    <ArrowRight size={16} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Practice areas
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Legal expertise for every matter.
              </h2>
            </div>

            <a
              href="/advocates"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 underline underline-offset-4"
            >
              Explore advocates
              <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="mt-12 grid border-l border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {practiceAreas.map((area, index) => (
              <a
                key={area}
                href={`/advocates?practiceArea=${encodeURIComponent(area)}`}
                className="group flex items-center justify-between border-b border-r border-slate-200 p-6 transition duration-300 hover:bg-slate-950 hover:text-white"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-500">
                    0{index + 1}
                  </span>
                  <span className="font-semibold">{area}</span>
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-slate-400 transition group-hover:text-white"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-slate-950 py-24 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                How it works
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Find.
                <br />
                Book.
                <br />
                Manage.
              </h2>

              <p className="mt-6 max-w-md leading-7 text-slate-400">
                A straightforward experience designed for people who need legal
                help and advocates who manage legal matters every day.
              </p>
            </div>

            <div className="border-t border-white/10">
              {[
                [
                  "01",
                  "Search",
                  "Search verified advocates using your practice area, city, and other preferences.",
                ],
                [
                  "02",
                  "Choose & Book",
                  "Review professional profiles and request an available consultation time.",
                ],
                [
                  "03",
                  "Stay Organized",
                  "Manage appointments, cases, hearings, and important legal information.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="group grid gap-5 border-b border-white/10 py-8 transition sm:grid-cols-[70px_180px_1fr] sm:items-start hover:bg-white/[0.02]"
                >
                  <span className="text-sm font-bold text-slate-500">
                    {number}
                  </span>

                  <h3 className="text-xl font-bold">{title}</h3>

                  <p className="text-sm leading-7 text-slate-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ADVOCATE CTA */}
      <section id="advocates" className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative overflow-hidden border border-slate-200 bg-slate-100 px-7 py-14 shadow-sm sm:px-12 sm:py-16">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white" />

            <div className="relative max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                For advocates
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Build your professional legal practice.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Create your professional profile and manage appointments,
                clients, cases, hearings, and your legal practice from one
                organized dashboard.
              </p>

              <a
                href="/register?role=advocate"
                className="mt-8 inline-flex items-center gap-2 bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Join as an Advocate
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-slate-950 text-white">
                <Scale size={18} />
              </div>
              <span className="font-bold">LegalConnect</span>
            </a>

            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <a href="/advocates" className="hover:text-slate-950">
                Find Advocates
              </a>
              <a href="/login" className="hover:text-slate-950">
                Login
              </a>
              <a href="/register" className="hover:text-slate-950">
                Register
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs leading-5 text-slate-500">
              © 2026 LegalConnect. General legal information only. LegalConnect
              does not provide legal advice.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
