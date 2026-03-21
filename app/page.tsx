import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-8">
      <section aria-labelledby="home-heading">
        <h1 id="home-heading" className="mb-4 text-3xl font-bold text-slate-50">
          Energy Aid Finder
        </h1>
        <p className="mb-6 text-lg text-slate-200">
          Answer a few simple questions to see which Ontario energy supports you
          might qualify for.
        </p>

        <div className="space-y-3">
          <Link
            href="/eligibility"
            className="inline-flex items-center rounded-md bg-yellow-400 px-6 py-3 text-base font-semibold text-black hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Start eligibility check
          </Link>

          <p className="text-sm text-slate-400">
            It usually takes less than 3 minutes to complete.
          </p>
        </div>
      </section>
    </main>
  );
}
