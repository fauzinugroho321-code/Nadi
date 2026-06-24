"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

// Utility Timezone WIB (+7)
function getTodayBoundsWIB() {
  const now = new Date();
  const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayWIB = new Date(wibTime);
  todayWIB.setUTCHours(0, 0, 0, 0); 
  const todayUTC = new Date(todayWIB.getTime() - 7 * 60 * 60 * 1000);
  const tomorrowUTC = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);
  return { today: todayUTC, tomorrow: tomorrowUTC };
}
// 1. Ambil absensi
export async function getAllAttendances() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.attendance.findMany({ orderBy: [{ date: "desc" }, { clockIn: "desc" }], include: { user: { select: { name: true, workType: true, division: true } } }, take: 100 });
}

// 2. Ambil pengajuan cuti
export async function getAllLeaveRequests() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.leaveRequest.findMany({ orderBy: { createdAt: "desc" }, include: { requester: { include: { division: true } } } });
}

// 3. Update status cuti (BUG FIX: Cegah Konflik Tumpang Tindih BOS vs HR)
export async function updateLeaveStatus(requestId: string, status: "APPROVED" | "REJECTED", note?: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  
  // Validasi: Pastikan cuti belum diproses orang lain!
  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (request?.status !== "PENDING") throw new Error("Gagal! Pengajuan ini sudah diproses oleh administrator lain.");

  await prisma.leaveRequest.update({ where: { id: requestId }, data: { status, approverId: session.user.id } });
  revalidatePath("/hr/leave-requests"); revalidatePath("/employee/dashboard"); revalidatePath("/employee/leave-requests");
}

// 4. Ambil semua karyawan (BUG FIX: Hanya tampilkan yang aktif)
export async function getAllEmployees() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.user.findMany({ where: { isActive: true }, include: { division: true }, orderBy: { name: "asc" } });
}

// 5. Dashboard HR
export async function getHRDashboardSummary() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  const { today, tomorrow } = getTodayBoundsWIB(); // Menggunakan Timezone WIB
  const pendingLeaves = await prisma.leaveRequest.findMany({ where: { status: "PENDING" }, include: { requester: { select: { name: true } } }, take: 5 });
  const flaggedAttendance = await prisma.attendance.findMany({ where: { date: { gte: today, lt: tomorrow }, OR: [{ status: "INCOMPLETE" }, { clockOut: null }] }, include: { user: { select: { name: true } } }, take: 5 });
  const todayAttendances = await prisma.attendance.findMany({ where: { date: { gte: today, lt: tomorrow } } });
  let present = 0, incomplete = 0, absent = 0, leave = 0;
  todayAttendances.forEach((a: any) => { if (a.status === "PRESENT") present++; else if (a.status === "INCOMPLETE") incomplete++; else if (a.status === "ABSENT") absent++; else if (a.status === "LEAVE") leave++; });
  return { pendingLeaves, flaggedAttendance, stats: { present, incomplete, absent, leave } };
}

// 6. Ambil semua divisi (Hanya hitung anggota aktif)
export async function getAllDivisions() {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  const divisions = await prisma.division.findMany({ include: { users: { where: { isActive: true }, include: { salaries: { orderBy: { effectiveDate: 'desc' }, take: 1 } } } }, orderBy: { name: 'asc' } });
  
  return divisions.map((div: any) => {
    const headcount = div.users.length;
    const budget = div.users.reduce((total: number, user: any) => {
      const activeSalary = user.salaries?.[0]; 
      return total + (activeSalary ? Number(activeSalary.baseSalary || 0) + Number(activeSalary.allowance || 0) : 0);
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

// 8. Fungsi menarik Draf Gaji (Payroll)
export async function getPayrollDrafts(period: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "HR") throw new Error("Akses ditolak.");
  return await prisma.user.findMany({
    where: { role: { not: "BOSS" }, isActive: true }, // Hanya karyawan aktif
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
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");

  for (const entry of entries) {
    await prisma.payroll.upsert({
      where: { userId_period: { userId: entry.userId, period } },
      update: {
        status: "SUBMITTED",
        baseSalary: entry.baseSalary,
        allowance: entry.allowance,
        deductions: entry.deductions || 0,
        totalAmount: entry.totalAmount,
        submittedAt: new Date(),
      },
      create: {
        userId: entry.userId,
        period,
        baseSalary: entry.baseSalary,
        allowance: entry.allowance,
        deductions: entry.deductions || 0,
        totalAmount: entry.totalAmount,
        status: "SUBMITTED",
        submittedAt: new Date(),
      }
    });
  }
  revalidatePath("/hr/payroll");
}

// 9b. BARU: Fitur Rollback / Tarik Draf Payroll oleh HR
export async function cancelPayrollSubmit(period: string) {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "HR") throw new Error("Akses ditolak.");
  
  // Hapus entri berstatus SUBMITTED agar kembali menjadi DRAFT bersih di layar HR
  await prisma.payroll.deleteMany({ where: { period, status: "SUBMITTED" } });
  
  revalidatePath("/hr/payroll");
  revalidatePath("/boss/payroll");
}

// 10. Mengambil detail komprehensif satu karyawan
export async function getEmployeeDetail(id: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  return await prisma.user.findUnique({
    where: { id },
    include: {
      division: true,
      salaries: { orderBy: { effectiveDate: "desc" }, take: 1 },
      attendances: { orderBy: { date: "desc" }, take: 5 },
      tasksAssigned: { orderBy: { createdAt: "desc" }, take: 5 }, 
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
    }
  });
}

// 11. Fungsi Invite Karyawan Baru
export async function inviteEmployee(data: { name: string; email: string; password: string; divisionId: string; workType: "WFO" | "WFH" | "HYBRID"; }) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error("Email ini sudah terdaftar di sistem.");
  await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash: await hash(data.password, 10), role: "EMPLOYEE", workType: data.workType, divisionId: data.divisionId, isActive: true }
  });
  revalidatePath("/hr/employees"); revalidatePath("/boss/employees");
}

// 12. CRUD Divisi
export async function createDivision(name: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  await prisma.division.create({ data: { name } });
  revalidatePath("/hr/divisions");
}
export async function deleteDivision(id: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  
  // PROTEKSI: Cek apakah divisi masih punya karyawan
  const div = await prisma.division.findUnique({ where: { id }, include: { users: true } });
  if (div && div.users.length > 0) throw new Error("Gagal: Divisi masih memiliki karyawan aktif.");

  await prisma.division.delete({ where: { id } });
  revalidatePath("/hr/divisions");
}
export async function updateDivision(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  await prisma.division.update({ where: { id }, data: { name } });
  revalidatePath("/hr/divisions");
}

// 13. Fungsi Assign Task
export async function createTask(data: { title: string; description: string; assigneeId: string; dueDate: Date }) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  await prisma.task.create({ data: { title: data.title, description: data.description, assigneeId: data.assigneeId, creatorId: session.user.id, status: "TODO", dueDate: data.dueDate } });
  revalidatePath("/hr/tasks"); revalidatePath("/boss/tasks"); revalidatePath("/employee/tasks"); revalidatePath("/employee/dashboard");
}

// 14. Fix Attendance Entry
export async function fixAttendanceEntry(attendanceId: string, clockIn: Date, clockOut: Date | null) {
  const session = await auth();
  if (!session?.user?.id || !["HR", "BOSS"].includes((session.user as any).role)) throw new Error("Akses ditolak.");
  const isComplete = clockIn && clockOut;
  await prisma.attendance.update({
    where: { id: attendanceId },
    data: { clockIn, clockOut, status: isComplete ? "PRESENT" : "INCOMPLETE" }
  });
  revalidatePath("/hr/attendance");
}