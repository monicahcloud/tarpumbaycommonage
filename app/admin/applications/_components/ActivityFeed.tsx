/* eslint-disable @typescript-eslint/no-explicit-any */
import { FilePlus, FileX2, RefreshCw } from "lucide-react";

type AdminEvent = {
  id: string;
  type: string;
  message: string;
  actorClerkId: string;
  meta: any;
  createdAt: Date;
};

function icon(type: string) {
  switch (type) {
    case "ATTACHMENT_ADDED":
      return <FilePlus className="h-4 w-4 text-emerald-700" />;
    case "ATTACHMENT_DELETED":
      return <FileX2 className="h-4 w-4 text-rose-700" />;
    case "REOPENED":
      return <RefreshCw className="h-4 w-4 text-slate-700" />;
    case "STATUS_CHANGED":
      return <RefreshCw className="h-4 w-4 text-slate-700" />;
    default:
      return <RefreshCw className="h-4 w-4 text-slate-700" />;
  }
}

export default function ActivityFeed({ events }: { events: AdminEvent[] }) {
  if (!events?.length) {
    return <p className="mt-2 text-sm text-slate-600">No recent activity.</p>;
  }

  return (
    <ul className="mt-3 space-y-2">
      {events.map((e) => (
        <li
          key={e.id}
          className="rounded-xl border bg-slate-50 px-3 py-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">{icon(e.type)}</div>
              <div>
                <div className="text-slate-900">{e.message}</div>
                <div className="text-xs text-slate-500">
                  <span className="font-mono">{e.actorClerkId}</span>
                  {e.meta?.kind ? (
                    <>
                      {" "}
                      • Kind:{" "}
                      <span className="font-semibold">{e.meta.kind}</span>
                    </>
                  ) : null}
                  {e.meta?.target ? (
                    <>
                      {" "}
                      • Target:{" "}
                      <span className="font-semibold">{e.meta.target}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-xs text-slate-500">
              {new Date(e.createdAt).toLocaleString()}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
