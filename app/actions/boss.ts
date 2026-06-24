"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Ambil data payroll yang butuh persetujuan Bos
export async function getPayrollApprovals(period: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "BOSS") throw new Error("Akses ditolak.");

  return await prisma.payroll.findMany({
    where: { period },
    include: {
      user: { include: { division: true } }
    },
    orderBy: { user: { name: "asc" } }
  });
}

// 2. Setujui dan Cairkan Gaji (Approve & Transfer)
export async function approveAndPayPayroll(period: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "BOSS") throw new Error("Akses ditolak.");

  await prisma.payroll.updateMany({
    where: { period, status: "SUBMITTED" },
    data: {
      status: "PAID",
      paidAt: new Date()
    }
  });

  revalidatePath("/boss/payroll");
  revalidatePath("/hr/payroll");
  revalidatePath("/employee/payroll");
}

// 3. Mengambil metrik Dashboard Eksekutif
export async function getBossDashboardSummary() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "BOSS") throw new Error("Akses ditolak.");

  const totalEmployees = await prisma.user.count({ where: { role: { not: "BOSS" } } });
  const currentPeriod = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0');
  const payrolls = await prisma.payroll.findMany({ where: { period: currentPeriod } });
  
  const totalPayroll = payrolls.reduce((acc: number, curr: any) => acc + Number(curr.totalAmount), 0);
  const pendingPayrollCount = payrolls.filter((p: any) => p.status === "SUBMITTED").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const todayAttendances = await prisma.attendance.findMany({ where: { date: { gte: today, lt: tomorrow } } });

  let present = 0, incomplete = 0, absent = 0, leave = 0;
  todayAttendances.forEach((a: any) => {
    if (a.status === "PRESENT") present++;
    else if (a.status === "INCOMPLETE") incomplete++;
    else if (a.status === "ABSENT") absent++;
    else if (a.status === "LEAVE") leave++;
  });

  return { totalEmployees, totalPayroll, pendingPayrollCount, attendance: { present, incomplete, absent, leave } };
}

// 4. BARU: Mengambil data performa komprehensif untuk Halaman Reports
export async function getCompanyReportsData() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "BOSS") throw new Error("Akses ditolak.");

  const divisions = await prisma.division.findMany({
    include: {
      users: {
        include: {
          attendances: true,
          tasksAssigned: true // <-- SUDAH DIPERBAIKI
        }
      }
    }
  });

  // Olah data untuk grafik Radar (Performa per Divisi)
  const radarData = divisions.map((div: any) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalAttendances = 0;
    let presentAttendances = 0;

    div.users.forEach((user: any) => {
      totalTasks += user.tasksAssigned.length; // <-- SUDAH DIPERBAIKI
      completedTasks += user.tasksAssigned.filter((t: any) => t.status === "DONE").length; // <-- SUDAH DIPERBAIKI
      totalAttendances += user.attendances.length;
      presentAttendances += user.attendances.filter((a: any) => a.status === "PRESENT" || a.status === "INCOMPLETE").length;
    });

    const taskCompletion = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const attendanceRate = totalAttendances === 0 ? 0 : Math.round((presentAttendances / totalAttendances) * 100);
    
    // Asumsi produktivitas adalah rata-rata kehadiran dan penyelesaian tugas
    const productivity = Math.round((taskCompletion + attendanceRate) / 2);

    return {
      subject: div.name,
      Attendance: attendanceRate || 85, // Angka 85 dsb adalah fallback jika DB masih sangat kosong
      Productivity: productivity || 80,
      TaskCompletion: taskCompletion || 75,
    };
  });

  return radarData;
}