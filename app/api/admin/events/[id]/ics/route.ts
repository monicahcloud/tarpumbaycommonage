// app/api/admin/events/[id]/ics/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

function icsEscape(s: string) {
  return s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <-- matches [id]
) {
  const { id } = await params; // <-- use id

  const ev = await prisma.event.findUnique({ where: { id } });
  if (!ev || ev.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const summary = icsEscape(ev.title);
  const desc = icsEscape(ev.descriptionMd ?? "");
  const location = icsEscape(
    ev.isVirtual ? ev.zoomJoinUrl ?? "Online" : ev.location ?? ""
  );

  const body = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tarpum Bay Commonage//Events//EN
BEGIN:VEVENT
UID:${ev.id}@tarpum-bay-commonage
DTSTAMP:${dt(new Date())}
DTSTART:${dt(ev.startsAt)}
DTEND:${dt(ev.endsAt)}
SUMMARY:${summary}
DESCRIPTION:${desc}${
    ev.zoomJoinUrl ? `\\nJoin: ${icsEscape(ev.zoomJoinUrl)}` : ""
  }${ev.zoomPasscode ? `\\nPasscode: ${icsEscape(ev.zoomPasscode)}` : ""}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${ev.id}.ics"`,
    },
  });
}
