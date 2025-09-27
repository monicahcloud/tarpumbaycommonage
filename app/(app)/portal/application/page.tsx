// app/(app)/portal/applications/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ApplicationsPage() {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  const apps = await prisma.application.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Applications</h1>
      <ul className="grid gap-3">
        {apps.map((a) => (
          <li key={a.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  #{a.id.slice(0, 8)} — {a.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  className="rounded border px-3 py-1 text-sm"
                  href={`/portal/applications/${a.id}/uploads`}>
                  Uploads
                </Link>
                <a
                  className="rounded border px-3 py-1 text-sm"
                  href={`/api/applications/${a.id}/pdf`}>
                  PDF
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
