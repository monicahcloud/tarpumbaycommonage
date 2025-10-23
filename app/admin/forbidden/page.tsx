// app/admin/forbidden/page.tsx
export const runtime = "nodejs";
export default function Forbidden() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Access denied</h1>
      <p className="text-slate-600 mt-2 text-sm">
        You’re signed in, but you don’t have access to the admin area.
      </p>
    </div>
  );
}
