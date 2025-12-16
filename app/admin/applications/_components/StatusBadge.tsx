// app/admin/applications/_components/StatusBadge.tsx
export default function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "APPROVED"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "REJECTED"
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : status === "UNDER_REVIEW"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : status === "SUBMITTED"
      ? "bg-cyan-50 text-cyan-800 border-cyan-200"
      : "bg-slate-50 text-slate-800 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
