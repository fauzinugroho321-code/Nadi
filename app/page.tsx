import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session) redirect("/login");

  switch (session.user.role) {
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
