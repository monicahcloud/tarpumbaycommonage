// app/(app)/news/page.tsx
import NewsAnnouncements, {
  type NewsItem,
} from "@/components/NewsAnnouncements";
import { headers } from "next/headers";

export const revalidate = 60;

async function getBaseUrl() {
  const h = await headers(); // 👈 await here
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function NewsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || (await getBaseUrl());

  const url = new URL("/api/news", base);
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return <NewsAnnouncements initialItems={[]} />;
  }

  const data = (await res.json()) as { items: NewsItem[] };
  return <NewsAnnouncements initialItems={data.items} />;
}
