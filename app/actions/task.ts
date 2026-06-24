"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Ambil semua tugas untuk Karyawan yang sedang login
export async function getEmployeeTasks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  return await prisma.task.findMany({
    where: { assigneeId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

// 2. Update status saat kartu tugas di-Drag & Drop
export async function updateTaskStatus(taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE" | "LATE") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  // Refresh halaman agar data terbaru langsung tampil
  revalidatePath("/employee/tasks");
  revalidatePath("/employee/dashboard");
}

// 3. Fungsi Bantuan Sementara (Hanya agar Anda bisa mencoba seret-lepas hari ini)
export async function createDemoTask() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  await prisma.task.create({
    data: {
      title: "Tugas Simulasi " + Math.floor(Math.random() * 1000),
      description: "Seret kartu ini ke kolom sebelah untuk mencoba fitur Kanban.",
      creatorId: session.user.id, // Anggap saja dibuat oleh diri sendiri untuk demo
      assigneeId: session.user.id,
      status: "TODO",
      dueDate: new Date(Date.now() + 86400000 * 3), // Tenggat 3 hari ke depan
    }
  });

  revalidatePath("/employee/tasks");
}