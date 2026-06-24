"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getEmployeeDashboardData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  const userId = session.user.id;

  // 1. Ambil 5 tugas yang belum selesai (bukan DONE), urutkan dari yang paling mendesak
  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: { not: "DONE" }
    },
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ],
    take: 5
  });

  // 2. Ambil 5 notifikasi / update terbaru untuk user ini
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return { tasks, notifications };
}