"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { division: true }
  });

  return user;
}

// BARU: Fungsi untuk menarik 5 notifikasi terbaru pengguna yang sedang login
export async function getMyNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
}