import { notFound } from "next/navigation";
import { DOCUMENTS } from "@/data/documents";

export const revalidate = 60;

type Params = { slug: string };

export default async function DocumentDetail({
  params,
}: {
  params: Promise<Params>; // <-- Next 15 expects a Promise here
}) {
  const { slug } = await params; // <-- await the params

  const doc = DOCUMENTS.find((d) => d.slug === slug);
  if (!doc) return notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-2 text-xs text-slate-500">{doc.category}</div>
      <h1 className="text-2xl font-bold">{doc.title}</h1>
      {doc.description ? (
        <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-600">
        <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
        <span>Status: {doc.status}</span>
        {doc.tags?.length ? <span>Tags: {doc.tags.join(", ")}</span> : null}
      </div>

      <div className="mt-6">
        <a
          href={doc.url}
          target={doc.url.startsWith("http") ? "_blank" : undefined}
          rel={doc.url.startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-white font-semibold shadow-sm hover:bg-primary/90">
          {doc.type === "link" ? "Open Document" : "Download / View"}
        </a>
      </div>
    </main>
  );
}

// (Optional, recommended) pre-generate active slugs
export async function generateStaticParams(): Promise<Params[]> {
  return DOCUMENTS.filter((d) => d.status === "ACTIVE").map((d) => ({
    slug: d.slug,
  }));
}
