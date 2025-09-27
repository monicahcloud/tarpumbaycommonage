// app/apply/actions.ts
"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.object({
    first: z.string().min(1),
    middle: z.string().optional(),
    last: z.string().min(1),
  }),
  dob: z.string(), // ISO date string
  address: z.string().min(3),
  phones: z.object({
    home: z.string().optional(),
    work: z.string().optional(),
    cell: z.string().optional(),
  }),
  email: z.string().email(),
  ancestry: z.object({
    parentName: z.string().optional(),
    parentBirthdate: z.string().optional(),
    grandparentName: z.string().optional(),
    grandparentBirthdate: z.string().optional(),
    greatGrandparentName: z.string().optional(),
    greatGrandparentBirthdate: z.string().optional(),
  }),
  purpose: z.string().min(3),
  agreeRules: z
    .boolean()
    .refine((v) => v === true, "You must agree to the rules."),
  signature: z.string().min(2),
});

export async function submitApplication(userId: string, raw: unknown) {
  const v = schema.parse(raw);

  // Choose a single phone to store (prioritize cell -> home -> work)
  const phone = v.phones.cell || v.phones.home || v.phones.work || undefined;

  // Combine ancestry into one string column you already have
  const ancestry =
    [
      v.ancestry.parentName &&
        `Parent: ${v.ancestry.parentName} (${
          v.ancestry.parentBirthdate || "—"
        })`,
      v.ancestry.grandparentName &&
        `Grandparent: ${v.ancestry.grandparentName} (${
          v.ancestry.grandparentBirthdate || "—"
        })`,
      v.ancestry.greatGrandparentName &&
        `Great-Grandparent: ${v.ancestry.greatGrandparentName} (${
          v.ancestry.greatGrandparentBirthdate || "—"
        })`,
    ]
      .filter(Boolean)
      .join(" | ") || null;

  const app = await prisma.application.create({
    data: {
      userId,
      status: "SUBMITTED",
      submittedAt: new Date(),

      // flattened fields → your columns
      firstName: v.name.first,
      lastName: v.name.last,
      email: v.email,
      phone: phone ?? null,
      dob: v.dob ? new Date(v.dob) : null,
      address: v.address,
      ancestry,
      purpose: v.purpose,
      signature: v.signature,
    },
    select: { id: true },
  });

  return app.id;
}
