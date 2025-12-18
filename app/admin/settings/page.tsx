// app/admin/settings/page.tsx
import { getAdminGate } from "@/lib/authz";
import { redirect } from "next/navigation";
import { getLandApplicationsSetting } from "@/lib/settings";
import LandApplicationsToggle from "./toggle.client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const gate = await getAdminGate();
  if (!gate.signedIn) redirect("/sign-in?redirect_url=/admin/settings");
  if (!gate.ok) redirect("/forbidden");

  const { open, updatedAt } = await getLandApplicationsSetting();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Site Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Control site-wide features like whether land applications are open.
        </p>
      </div>

      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">Land applications</h3>
            <p className="mt-1 text-sm text-slate-600">
              Turn this off when the Committee is not accepting land
              applications.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Last updated:{" "}
              {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
            </p>
          </div>

          <LandApplicationsToggle initialOpen={open} />
        </div>
      </div>
    </div>
  );
}
