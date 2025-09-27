/* eslint-disable @typescript-eslint/no-explicit-any */
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
  dob: z.string(), // ISO
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
  signature: z.string().min(10), // data URL or vector
});

export async function submitApplication(userId: string, data: unknown) {
  const parsed = schema.parse(data);
  const app = await prisma.application.create({
    data: {
      userId,
      status: "SUBMITTED",
      data: parsed as any,
      timeline: { create: { type: "SUBMITTED" } },
    },
  });
  return app.id;
}
