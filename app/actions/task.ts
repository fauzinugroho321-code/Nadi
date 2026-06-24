"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEmployeeTasks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");
  return await prisma.task.findMany({
    where: { assigneeId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTaskStatus(taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE" | "LATE") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");
  await prisma.task.update({ where: { id: taskId }, data: { status: newStatus } });
  revalidatePath("/employee/tasks"); revalidatePath("/employee/dashboard");
}
// BACKDOOR DEMO TASK DIHAPUS 🗑️