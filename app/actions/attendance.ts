"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Fungsi untuk mengambil status absensi HARI INI
export async function getTodayAttendance() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const record = await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: today, lt: tomorrow },
    },
  });

  return record;
}

// 2. Fungsi untuk melakukan Clock In atau Clock Out
export async function toggleClockInOut() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  const userId = session.user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const existingRecord = await prisma.attendance.findFirst({
    where: {
      userId,
      date: { gte: today, lt: tomorrow },
    },
  });

  if (!existingRecord) {
    await prisma.attendance.create({
      data: {
        userId: userId,
        date: new Date(),    
        clockIn: new Date(), 
        status: "PRESENT",
      },
    });
  } else if (!existingRecord.clockOut) {
    await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: { clockOut: new Date() }, 
    });
  }

  revalidatePath("/employee/dashboard");
}

// 3. BARU: Fungsi untuk mengambil riwayat absensi bulanan
export async function getMyAttendanceHistory(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  // Bulan di JavaScript dimulai dari 0 (Januari) sampai 11 (Desember)
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  return await prisma.attendance.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });
}