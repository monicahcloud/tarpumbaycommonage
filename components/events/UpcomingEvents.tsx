// components/events/UpcomingEvents.tsx
"use client";
import { useEffect, useState } from "react";

type EventItem = {
  id: string;
  slug: string;
  title: string;
  descriptionMd?: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  isVirtual: boolean;
  location?: string | null;
  zoomJoinUrl?: string | null;
  zoomPasscode?: string | null;
};

function googleCalendarLink(ev: EventItem) {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const start = fmt(new Date(ev.startsAt));
  const end = fmt(new Date(ev.endsAt));
  const text = encodeURIComponent(ev.title);
  const details = encodeURIComponent(
    (ev.descriptionMd ?? "") +
      (ev.zoomJoinUrl ? `\nJoin: ${ev.zoomJoinUrl}` : "") +
      (ev.zoomPasscode ? `\nPasscode: ${ev.zoomPasscode}` : "")
  );
  const location = encodeURIComponent(
    ev.isVirtual ? ev.zoomJoinUrl ?? "Online" : ev.location ?? ""
  );
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    fetch("/api/events/upcoming")
      .then((r) => r.json())
      .then((d) => setEvents(d.items));
  }, []);

  if (events.length === 0)
    return <div className="text-slate-500">No upcoming events.</div>;

  return (
    <ul className="space-y-4">
      {events.map((ev) => (
        <li key={ev.id} className="border rounded p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">{ev.title}</h3>
            <div className="flex gap-2">
              <a
                className="underline text-blue-600"
                href={`/api/events/${ev.slug}/ics`}>
                Download .ics
              </a>
              <a
                className="underline text-blue-600"
                target="_blank"
                rel="noreferrer"
                href={googleCalendarLink(ev)}>
                Add to Google
              </a>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {new Date(ev.startsAt).toLocaleString()} —{" "}
            {new Date(ev.endsAt).toLocaleString()}
          </div>
          <div className="text-sm mt-1">
            {ev.isVirtual ? (
              <span>Virtual</span>
            ) : ev.location ? (
              <span>{ev.location}</span>
            ) : null}
          </div>
          {ev.isVirtual && ev.zoomJoinUrl && (
            <div className="mt-2">
              <a
                className="inline-block px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                href={ev.zoomJoinUrl}
                target="_blank"
                rel="noreferrer">
                Join Zoom
              </a>
              {ev.zoomPasscode && (
                <span className="ml-3 text-sm text-slate-600">
                  Passcode: <span className="font-mono">{ev.zoomPasscode}</span>
                </span>
              )}
            </div>
          )}
          {ev.descriptionMd && (
            <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">
              {ev.descriptionMd}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
