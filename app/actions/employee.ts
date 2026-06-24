"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getEmployeeDashboardData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");
  const userId = session.user.id;
  
  // Ambil tipe kerja aslinya dari DB
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { workType: true } });
  
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId, status: { not: "DONE" } },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    take: 5
  });
  const notifications = await prisma.notification.findMany({
    where: { userId }, orderBy: { createdAt: 'desc' }, take: 5
  });
  return { tasks, notifications, workType: user?.workType || "WFO" };
}