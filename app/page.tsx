import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  // 1. Pastikan session dan session.user benar-benar ada
  if (!session?.user) redirect("/login");

  // 2. Gunakan 'as any' untuk membypass batasan tipe bawaan NextAuth
  switch ((session.user as any).role) {
    case "BOSS":
      redirect("/boss/dashboard");
    case "HR":
      redirect("/hr/dashboard");
    case "EMPLOYEE":
      redirect("/employee/dashboard");
    default:
      redirect("/login");
  }
}