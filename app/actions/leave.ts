"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fungsi untuk mengambil riwayat cuti Karyawan
export async function getMyLeaveRequests() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  return await prisma.leaveRequest.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

// 2. Fungsi untuk mengirimkan pengajuan cuti baru
export async function submitLeaveRequest(data: {
  type: "CUTI" | "IZIN" | "SAKIT";
  startDate: Date;
  endDate: Date;
  reason: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  // Simpan ke database
  await prisma.leaveRequest.create({
    data: {
      requesterId: session.user.id,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: "PENDING", // Otomatis pending menunggu HR
    },
  });

  // Refresh halaman agar pengajuan baru langsung muncul di tabel
  revalidatePath("/employee/leave-requests");
  revalidatePath("/employee/dashboard");
}