"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fungsi mengambil semua riwayat slip gaji karyawan
export async function getMyPayrolls() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  return await prisma.payroll.findMany({
    where: { userId: session.user.id },
    orderBy: { period: "desc" }, // Urutkan dari bulan terbaru
  });
}

// 2. Fungsi membuat slip gaji bohongan (Khusus untuk testing saat ini)
export async function createDemoPayroll() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  const period = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0'); // Sesuai desain dummy

  // Cek agar tidak terbuat ganda
  const existing = await prisma.payroll.findFirst({
    where: { userId: session.user.id, period }
  });

  if (!existing) {
    await prisma.payroll.create({
      data: {
        userId: session.user.id,
        period: period,
        baseSalary: 10000000,
        allowance: 2500000,
        deductions: 500000,
        totalAmount: 12000000,
        status: "PAID",
        paidAt: new Date(),
      }
    });
    revalidatePath("/employee/payroll");
  }
}