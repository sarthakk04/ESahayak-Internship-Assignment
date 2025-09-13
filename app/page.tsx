// app/buyers/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function BuyersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in"); // force login
  }

  return <div>List of buyers...</div>;
}
