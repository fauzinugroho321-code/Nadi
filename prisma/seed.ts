import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Memulai proses seeding data...")

  // 1. Buat Divisi
  const divEngineering = await prisma.division.upsert({ where: { name: 'Engineering' }, update: {}, create: { name: 'Engineering' } })
  const divMarketing = await prisma.division.upsert({ where: { name: 'Marketing' }, update: {}, create: { name: 'Marketing' } })
  const divOperations = await prisma.division.upsert({ where: { name: 'Operations' }, update: {}, create: { name: 'Operations' } })
  const divHR = await prisma.division.upsert({ where: { name: 'Human Resources' }, update: {}, create: { name: 'Human Resources' } })

  // 2. Buat Akun BOSS & HR (Perhatikan perubahan menjadi passwordHash)
  const boss = await prisma.user.upsert({
    where: { email: 'boss@nadi.app' },
    update: {},
    create: { name: 'David Kim', email: 'boss@nadi.app', passwordHash: 'password123', role: 'BOSS' as any, workType: 'WFO' as any, divisionId: divOperations.id, isActive: true }
  })

  const hr = await prisma.user.upsert({
    where: { email: 'hr@nadi.app' },
    update: {},
    create: { name: 'Ayu Kartika', email: 'hr@nadi.app', passwordHash: 'password123', role: 'HR' as any, workType: 'HYBRID' as any, divisionId: divHR.id, isActive: true }
  })

  // 3. Buat 5 Karyawan Dummy
  const employeesData = [
    { name: 'Alex Lim', email: 'alex@nadi.app', role: 'EMPLOYEE' as any, workType: 'WFO' as any, divisionId: divEngineering.id },
    { name: 'Budi Santoso', email: 'budi@nadi.app', role: 'EMPLOYEE' as any, workType: 'WFH' as any, divisionId: divEngineering.id },
    { name: 'Citra Kirana', email: 'citra@nadi.app', role: 'EMPLOYEE' as any, workType: 'HYBRID' as any, divisionId: divMarketing.id },
    { name: 'Diana Putri', email: 'diana@nadi.app', role: 'EMPLOYEE' as any, workType: 'WFO' as any, divisionId: divOperations.id },
    { name: 'Evan Dimas', email: 'evan@nadi.app', role: 'EMPLOYEE' as any, workType: 'WFH' as any, divisionId: divMarketing.id },
  ];

  const employees = [];
  for (const emp of employeesData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { ...emp, passwordHash: 'password123', isActive: true } // Perubahan di sini juga
    });
    employees.push(user);

    // Set Gaji Karyawan
    await prisma.salary.create({
      data: {
        userId: user.id,
        baseSalary: Math.floor(Math.random() * 5000000) + 7000000, 
        allowance: Math.floor(Math.random() * 2000000) + 1000000, 
        effectiveDate: new Date('2024-01-01')
      }
    });

    console.log(`✅ Created User: ${user.name}`);
  }

  // 4. Generate Absensi Bulan Ini (Untuk 5 Karyawan)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  for (const emp of employees) {
    for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue; // Lewati hari libur

      const isLate = Math.random() > 0.8;
      const isAbsent = Math.random() > 0.95;

      if (!isAbsent) {
        const clockIn = new Date(d);
        clockIn.setHours(isLate ? 9 : 8, Math.floor(Math.random() * 59), 0);
        
        const clockOut = new Date(d);
        clockOut.setHours(17, Math.floor(Math.random() * 30), 0);

        await prisma.attendance.create({
          data: {
            userId: emp.id,
            date: new Date(d),
            clockIn,
            clockOut,
            status: isLate ? 'INCOMPLETE' as any : 'PRESENT' as any
          }
        });
      } else {
        await prisma.attendance.create({
          data: { userId: emp.id, date: new Date(d), status: 'ABSENT' as any }
        });
      }
    }
  }

  // 5. Generate Tugas (Kanban)
  const statuses: any[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  for (const emp of employees) {
    for (let i = 0; i < 4; i++) {
      await prisma.task.create({
        data: {
          title: `Tugas Project ${Math.floor(Math.random() * 100)} - ${emp.name.split(' ')[0]}`,
          description: 'Selesaikan dokumen laporan dan kodingan fitur ini secepatnya sesuai dengan requirement.',
          assigneeId: emp.id,
          creatorId: hr.id,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          dueDate: new Date(today.getTime() + (Math.random() * 10 - 5) * 86400000) 
        }
      });
    }
  }

  // 6. Generate Cuti
  for (const emp of employees.slice(0, 3)) { 
    await prisma.leaveRequest.create({
      data: {
        requesterId: emp.id,
        type: 'CUTI' as any,
        startDate: new Date(today.getTime() + 86400000 * 2), 
        endDate: new Date(today.getTime() + 86400000 * 4),
        reason: 'Acara keluarga di luar kota',
        status: 'PENDING' as any
      }
    });
  }

  console.log("🌳 Seeding selesai! Database Nadi sekarang sudah penuh kehidupan.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });