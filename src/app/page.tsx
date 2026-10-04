import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Scale,
  Search,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Find the Right Advocate",
    description:
      "Search verified advocates by practice area, city, experience, rating, and availability.",
  },
  {
    icon: CalendarCheck,
    title: "Book a Consultation",
    description:
      "Choose an available time slot and request a consultation directly from an advocate.",
  },
  {
    icon: ShieldCheck,
    title: "Manage Your Legal Matters",
    description:
      "Keep appointments, cases, hearings, and important legal updates organized in one place.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-slate-200 bg-white">
        <div className="container-main flex h-18 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <Scale size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-950">
                LegalConnect
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Legal Platform
              </div>
            </div>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-700"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-700"
            >
              Features
            </a>
            <a
              href="#advocates"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-700"
            >
              For Advocates
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              Log in
            </a>
            <a
              href="/register"
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <section className="overflow-hidden bg-white">
        <div className="container-main grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700">
              <CheckCircle2 size={16} />
              Trusted legal assistance, simplified
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">
              Find the right advocate for your legal needs.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Discover verified advocates, compare their professional profiles,
              book consultations, and manage your legal matters from one secure
              platform.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/advocates"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 transition hover:bg-blue-800"
              >
                Find an Advocate
                <ArrowRight size={18} />
              </a>
              <a
                href="/legal-checker"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Check Your Legal Issue
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                Verified advocates
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                Easy booking
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600" />
                Secure case management
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-slate-200 blur-3xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-2xl shadow-slate-900/10">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Recommended for you
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Verified Advocates
                    </h2>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Scale size={22} />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["Family Law", "Experienced advocate"],
                    ["Property Law", "Verified professional"],
                    ["Criminal Law", "Available this week"],
                  ].map(([area, text]) => (
                    <div
                      key={area}
                      className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{area}</p>
                        <p className="mt-1 text-xs text-slate-500">{text}</p>
                      </div>
                      <ArrowRight size={17} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
              One platform
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Everything you need to manage your legal journey
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              From finding an advocate to keeping track of your cases and
              hearings, LegalConnect keeps everything organized.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="card p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-padding bg-white">
        <div className="container-main">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-700">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Find. Book. Manage.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                A simple process designed to make accessing legal help easier
                and more organized.
              </p>
            </div>

            <div className="space-y-4">
              {[
                ["01", "Search", "Tell us what legal help you need and discover relevant advocates."],
                ["02", "Book", "View availability and request a consultation at a convenient time."],
                ["03", "Manage", "Track your appointments, case information, and upcoming hearings."],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white">
                    {number}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="advocates" className="bg-blue-700">
        <div className="container-main flex flex-col gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-200">
              For advocates
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Build your professional presence.
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-blue-100">
              Manage clients, cases, hearings, appointments, and your public
              professional profile from one dashboard.
            </p>
          </div>

          <a
            href="/register?role=advocate"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Join as an Advocate
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container-main flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Scale size={17} />
            </div>
            <span className="font-bold text-slate-900">LegalConnect</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 LegalConnect. General legal information only.
          </p>
        </div>
      </footer>
    </main>
  );
}
