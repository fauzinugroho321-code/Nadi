"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

// 1. Fungsi untuk proses Login
export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/", 
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah." };
        default:
          return { error: "Terjadi kesalahan pada sistem." };
      }
    }
    throw error;
  }
}

// 2. Fungsi untuk proses Log Out
export async function logoutAction() {
  await signOut({
    redirectTo: "/login" 
  });
}

// 3. BARU: Fungsi mengambil data metrik real-time untuk halaman login
export async function getPublicMetrics() {
  // A. Hitung Tingkat Kehadiran Bulan Ini
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const attendances = await prisma.attendance.findMany({
    where: { date: { gte: firstDayOfMonth } }
  });

  let presentCount = 0;
  attendances.forEach((a: any) => {
    if (a.status === "PRESENT" || a.status === "INCOMPLETE") presentCount++;
  });
  
  const attendanceRate = attendances.length > 0
    ? ((presentCount / attendances.length) * 100).toFixed(1) + "%"
    : "0%";

  // B. Hitung Total Tugas yang Selesai
  const tasksDone = await prisma.task.count({
    where: { status: "DONE" }
  });

  // C. Hitung Total Karyawan Aktif
  const totalEmployees = await prisma.user.count({
    where: { role: { not: "BOSS" } }
  });

  return [
    { value: attendanceRate, label: "Attendance", sub: "This month", color: "#22D3EE" },
    { value: tasksDone.toString(), label: "Tasks Done", sub: "All time", color: "#A5B4FC" },
    { value: totalEmployees.toString(), label: "Active Staff", sub: "Registered", color: "#34D399" },
  ];
}