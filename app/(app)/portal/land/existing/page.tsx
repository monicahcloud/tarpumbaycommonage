// // app/portal/land/existing/page.tsx
// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/prisma";
// import { redirect } from "next/navigation";
// import ExistingLotForm from "./ExistingLotForm";

// export default async function ExistingLotStart() {
//   const { userId } = await auth();
//   if (!userId) redirect("/sign-in?redirect_url=/portal/land/existing");

//   const user = await prisma.user.findUnique({ where: { clerkId: userId } });
//   if (!user) redirect("/portal");

//   const reg = await prisma.commonerRegistration.findUnique({
//     where: { userId: user.id },
//   });
//   if (!reg || reg.status !== "APPROVED") redirect("/portal/commoner");

//   let app = await prisma.application.findUnique({ where: { userId: user.id } });
//   if (!app) {
//     app = await prisma.application.create({
//       data: {
//         userId: user.id,
//         commonerId: reg.id,
//         firstName: reg.firstName,
//         lastName: reg.lastName,
//         email: reg.email,
//         phone: reg.phone ?? null,
//         dob: reg.dob ?? null,
//         address: reg.address,
//         ancestry: reg.ancestry ?? null,
//         purpose: "Existing land holder confirmation",
//         alreadyHasLand: true,
//         status: "DRAFT",
//       },
//     });
//   } else if (!app.alreadyHasLand) {
//     app = await prisma.application.update({
//       where: { id: app.id },
//       data: { alreadyHasLand: true },
//     });
//   }

//   return (
//     <ExistingLotForm applicationId={app.id} lotNumber={app.lotNumber ?? ""} />
//   );
// }
// app/portal/land/existing/page.tsx  (only the guard changed)
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ExistingLotForm from "./ExistingLotForm";

export default async function ExistingLotStart() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal/land/existing");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/portal");

  const reg = await prisma.commonerRegistration.findUnique({
    where: { userId: user.id },
  });
  if (!reg || reg.status !== "APPROVED") redirect("/portal/commoner");

  let app = await prisma.application.findUnique({ where: { userId: user.id } });

  // 🚫 If they’ve started/applying for a lot (no existing lot), block this path
  //    i.e. they have a record with alreadyHasLand=false and a purpose != “Existing…”
  if (app && !app.alreadyHasLand && app.status !== "DRAFT") {
    redirect("/portal");
  }

  // create/upgrade the app to “alreadyHasLand” path
  if (!app) {
    app = await prisma.application.create({
      data: {
        userId: user.id,
        commonerId: reg.id,
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        phone: reg.phone ?? null,
        dob: reg.dob ?? null,
        address: reg.address,
        ancestry: reg.ancestry ?? null,
        purpose: "Existing land holder confirmation",
        alreadyHasLand: true,
        status: "DRAFT",
      },
    });
  } else if (!app.alreadyHasLand) {
    app = await prisma.application.update({
      where: { id: app.id },
      data: {
        alreadyHasLand: true,
        purpose: "Existing land holder confirmation",
      },
    });
  }

  return (
    <ExistingLotForm applicationId={app.id} lotNumber={app.lotNumber ?? ""} />
  );
}
