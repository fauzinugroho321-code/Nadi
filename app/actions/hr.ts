"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Ambil absensi
export async function getAllAttendances() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.attendance.findMany({ orderBy: [{ date: "desc" }, { clockIn: "desc" }], include: { user: { select: { name: true, workType: true } } }, take: 50 });
}

// 2. Ambil pengajuan cuti
export async function getAllLeaveRequests() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.leaveRequest.findMany({ orderBy: { createdAt: "desc" }, include: { requester: { include: { division: true } } } });
}

// 3. Update status cuti
export async function updateLeaveStatus(requestId: string, status: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  await prisma.leaveRequest.update({ where: { id: requestId }, data: { status, approverId: session.user.id } });
  revalidatePath("/hr/leave-requests"); revalidatePath("/employee/dashboard"); revalidatePath("/employee/leave-requests");
}

// 4. Ambil semua karyawan
export async function getAllEmployees() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.user.findMany({ include: { division: true }, orderBy: { name: "asc" } });
}

// 5. Dashboard HR
export async function getHRDashboardSummary() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const pendingLeaves = await prisma.leaveRequest.findMany({ where: { status: "PENDING" }, include: { requester: { select: { name: true } } }, take: 5 });
  const flaggedAttendance = await prisma.attendance.findMany({ where: { date: { gte: today, lt: tomorrow }, OR: [{ status: "INCOMPLETE" }, { clockOut: null }] }, include: { user: { select: { name: true } } }, take: 5 });
  const todayAttendances = await prisma.attendance.findMany({ where: { date: { gte: today, lt: tomorrow } } });
  let present = 0, incomplete = 0, absent = 0, leave = 0;
  todayAttendances.forEach((a: any) => { if (a.status === "PRESENT") present++; else if (a.status === "INCOMPLETE") incomplete++; else if (a.status === "ABSENT") absent++; else if (a.status === "LEAVE") leave++; });
  return { pendingLeaves, flaggedAttendance, stats: { present, incomplete, absent, leave } };
}

// 6. Ambil semua divisi
export async function getAllDivisions() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  const divisions = await prisma.division.findMany({ include: { users: { include: { salaries: { orderBy: { effectiveDate: 'desc' }, take: 1 } } } }, orderBy: { name: 'asc' } });
  return divisions.map((div: any) => {
    const headcount = div.users.length;
    const budget = div.users.reduce((total: number, user: any) => {
      const activeSalary = user.salaries[0];
      return activeSalary ? total + Number(activeSalary.baseSalary) + Number(activeSalary.allowance) : total;
    }, 0);
    return { id: div.id, name: div.name, headcount, budget };
  });
}

// 7. Ambil semua task (Kanban)
export async function getAllCompanyTasks() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.task.findMany({ include: { assignee: { include: { division: true } }, creator: true }, orderBy: { createdAt: "desc" } });
}

// 8. Fungsi menarik Draf Gaji (Payroll) bulan ini
export async function getPayrollDrafts(period: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "HR") throw new Error("Akses ditolak.");
  return await prisma.user.findMany({
    where: { role: { not: "BOSS" } },
    include: {
      division: true,
      salaries: { orderBy: { effectiveDate: "desc" }, take: 1 },
      payrolls: { where: { period } }
    },
    orderBy: { name: "asc" }
  });
}

// 9. Fungsi Submit Payroll ke BOSS
export async function submitPayrollBatch(period: string, entries: any[]) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "HR") throw new Error("Akses ditolak.");

  for (const entry of entries) {
    await prisma.payroll.upsert({
      where: { userId_period: { userId: entry.userId, period } },
      update: {
        status: "SUBMITTED",
        baseSalary: entry.baseSalary,
        allowance: entry.allowance,
        deductions: entry.deductions,
        totalAmount: entry.totalAmount,
        submittedAt: new Date(),
      },
      create: {
        userId: entry.userId,
        period,
        baseSalary: entry.baseSalary,
        allowance: entry.allowance,
        deductions: entry.deductions,
        totalAmount: entry.totalAmount,
        status: "SUBMITTED",
        submittedAt: new Date(),
      }
    });
  }
  revalidatePath("/hr/payroll");
}

// 10. BARU: Mengambil detail komprehensif satu karyawan berdasarkan ID
export async function getEmployeeDetail(id: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) {
    throw new Error("Akses ditolak.");
  }

  return await prisma.user.findUnique({
    where: { id },
    include: {
      division: true,
      salaries: { orderBy: { effectiveDate: "desc" }, take: 1 },
      attendances: { orderBy: { date: "desc" }, take: 5 },
      tasksAssigned: { orderBy: { createdAt: "desc" }, take: 5 }, // <-- SUDAH DIPERBAIKI
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
    }
  });
}

// 11. BARU: Fungsi Invite / Tambah Karyawan Baru
export async function inviteEmployee(data: {
  name: string;
  email: string;
  password: string; 
  divisionId: string;
  workType: "WFO" | "WFH" | "HYBRID";
}) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) {
    throw new Error("Akses ditolak.");
  }

  // Cek apakah email sudah dipakai
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error("Email ini sudah terdaftar di sistem.");

  // Simpan karyawan ke Database
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password, 
      role: "EMPLOYEE",
      workType: data.workType,
      divisionId: data.divisionId,
      isActive: true,
    }
  });

  // Segarkan halaman direktori
  revalidatePath("/hr/employees");
  revalidatePath("/boss/employees");
}

// 12. BARU: Fungsi Tambah Divisi
export async function createDivision(name: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  
  await prisma.division.create({ data: { name } });
  revalidatePath("/hr/divisions");
}

// 13. BARU: Fungsi Assign Task (Menugaskan Pekerjaan)
export async function createTask(data: { title: string; description: string; assigneeId: string; dueDate: Date }) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");

  await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      creatorId: session.user.id,
      status: "TODO",
      dueDate: data.dueDate,
    }
  });
  
  revalidatePath("/hr/tasks");
  revalidatePath("/boss/tasks");
  revalidatePath("/employee/tasks");
  revalidatePath("/employee/dashboard");
}