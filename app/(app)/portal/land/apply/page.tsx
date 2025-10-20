// // app/portal/land/apply/page.tsx
// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { redirect } from "next/navigation";

// export default async function ApplyLotStart() {
//   const { userId } = await auth();
//   if (!userId) redirect("/sign-in?redirect_url=/portal/land/apply");

//   const user = await prisma.user.findUnique({ where: { clerkId: userId } });
//   if (!user) redirect("/portal");

//   // Must be an APPROVED commoner to proceed
//   const reg = await prisma.commonerRegistration.findUnique({
//     where: { userId: user.id },
//   });
//   if (!reg || reg.status !== "APPROVED") {
//     redirect("/portal/commoner");
//   }

//   // Ensure exactly one Application per user
//   const existing = await prisma.application.findUnique({
//     where: { userId: user.id },
//   });

//   if (!existing) {
//     await prisma.application.create({
//       data: {
//         userId: user.id,
//         commonerId: reg.id, // if you added this field in your schema
//         firstName: reg.firstName,
//         lastName: reg.lastName,
//         email: reg.email,
//         phone: reg.phone ?? null,
//         dob: reg.dob ?? null,
//         address: reg.address,
//         ancestry: reg.ancestry ?? null,
//         purpose: "", // lot-specific fields start empty
//         status: "DRAFT",
//       },
//     });
//   } else if (!existing.commonerId) {
//     // link existing app to the commoner record if it isn’t already
//     await prisma.application.update({
//       where: { id: existing.id },
//       data: { commonerId: reg.id },
//     });
//   }

//   // Continue in the lot application editor (next step)
//   redirect("/portal/application");
// }

// app/portal/land/apply/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplyFormClient from "../../apply/ApplyFormClient";

export default async function ApplyForLotPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/land/apply");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/portal");

  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
  });
  if (!reg || reg.status !== "APPROVED") redirect("/portal/commoner");

  const app = await prisma.application.findUnique({
    where: { userId: user.id },
  });

  // 🚫 If they’ve confirmed they already have land, don’t let them apply
  if (app?.alreadyHasLand || app?.lotNumber) redirect("/portal");

  // ensure there is an app shell ready to fill (create if missing)
  // (optional) create a draft if you want, or let the form POST to create
  return <ApplyFormClient />;
}
