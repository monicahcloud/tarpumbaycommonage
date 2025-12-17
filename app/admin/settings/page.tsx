import { getLandApplicationsSetting } from "@/lib/settings";
import { updateLandApplications } from "./actions";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const setting = await getLandApplicationsSetting();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Land applications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-700">
            <div className="font-medium">
              {setting.open ? "Open" : "Closed"}
            </div>
            <div className="text-xs text-slate-500">
              When closed, users can still register as commoners, but cannot
              start land applications.
            </div>
          </div>

          {/* Server action via <form> so we stay simple */}
          <form
            action={async (fd: FormData) => {
              "use server";
              const open = fd.get("open") === "on";
              await updateLandApplications(open);
            }}>
            <div className="flex items-center gap-3">
              <Switch name="open" defaultChecked={setting.open} />
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
