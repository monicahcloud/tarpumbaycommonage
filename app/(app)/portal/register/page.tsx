import Link from "next/link";

export default function RegisterChoicePage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">Become a Member</h1>
      <p className="mt-1 text-slate-600">
        Choose how you’d like to get started.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Choice
          title="Register as a Commoner"
          desc="$25 annually. Confirm your details and upload documents."
          href="/portal/register/commoner"
        />
        <Choice
          title="Register & Apply for Land"
          desc="We’ll complete Commoner registration, then submit your land application."
          href="/portal/register/apply"
        />
      </div>
    </main>
  );
}

function Choice({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-white/80 p-5 shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
      <div className="mt-3 text-blue-600 font-medium">Continue →</div>
    </Link>
  );
}
