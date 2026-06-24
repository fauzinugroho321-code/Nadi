"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// UTILITY: Mengakali Timezone Server Vercel (UTC) menjadi Waktu Indonesia (WIB UTC+7)
// Ini mencegah error pergantian hari jika karyawan absen jam 6 pagi WIB (Jam 11 malam UTC di Vercel)
function getTodayBoundsWIB() {
  const now = new Date();
  
  // Geser waktu saat ini ke WIB (+7 jam)
  const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  
  // Ambil jam 00:00:00 dari hari WIB tersebut
  const todayWIB = new Date(wibTime);
  todayWIB.setUTCHours(0, 0, 0, 0); 
  
  // Kembalikan ke UTC untuk disimpan di Database Prisma
  const todayUTC = new Date(todayWIB.getTime() - 7 * 60 * 60 * 1000);
  const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);

  return { today: todayUTC, tomorrow: tomorrowUTC };
}

// 1. Fungsi untuk mengambil status absensi HARI INI
export async function getTodayAttendance() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { today, tomorrow } = getTodayBoundsWIB();

  return await prisma.attendance.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: today, lt: tomorrow },
    },
  });
}

// 2. Fungsi untuk melakukan Clock In atau Clock Out
export async function toggleClockInOut() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  const userId = session.user.id;
  const { today, tomorrow } = getTodayBoundsWIB();

  // FIX: Menggunakan Database Transaction untuk mencegah Race Condition (Double Click)
  await prisma.$transaction(async (tx) => {
    const existingRecord = await tx.attendance.findFirst({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
      },
    });

    if (!existingRecord) {
      // Clock IN
      await tx.attendance.create({
        data: {
          userId: userId,
          date: new Date(),     // Tersimpan dalam UTC, ditampilkan nanti sesuai lokal user
          clockIn: new Date(), 
          status: "PRESENT",
        },
      });
    } else if (!existingRecord.clockOut) {
      // Clock OUT
      await tx.attendance.update({
        where: { id: existingRecord.id },
        data: { clockOut: new Date() }, 
      });
    }
  });

  revalidatePath("/employee/dashboard");
}

// 3. Fungsi untuk mengambil riwayat absensi bulanan
export async function getMyAttendanceHistory(year: number, month: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Akses ditolak.");

  // Sesuaikan tarikan data bulanan berdasarkan offset WIB (-7 jam dari UTC)
  const startDate = new Date(Date.UTC(year, month, 1, -7, 0, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 16, 59, 59));

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