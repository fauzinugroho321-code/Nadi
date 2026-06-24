import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nadi",
  description: "Pemantauan kinerja karyawan: absensi, task, dan payroll"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
