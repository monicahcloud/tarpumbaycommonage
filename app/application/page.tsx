"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(1),
  dob: z.string(),
  address: z.string().min(1),
  telephone: z.string().min(1),
  email: z.string().email(),
  purpose: z.string().min(1),
});

export default function ApplicationPage() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      dob: "",
      address: "",
      telephone: "",
      email: "",
      purpose: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    const res = await fetch("/api/application", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      alert("Application submitted!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Full Name" {...form.register("name")} />
            <Input type="date" {...form.register("dob")} />
            <Input
              placeholder="Mailing Address"
              {...form.register("address")}
            />
            <Input placeholder="Telephone" {...form.register("telephone")} />
            <Input placeholder="Email" {...form.register("email")} />
            <Input
              placeholder="Purpose for Land"
              {...form.register("purpose")}
            />
            <Button type="submit">Submit Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
