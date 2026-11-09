import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // กำหนดไฟล์ Schema โมเดลตาราง
  schema: "prisma/schema.prisma",
  migrations: {
    // โฟลเดอร์เก็บประวัติ SQL Migration
    path: "prisma/migrations",
    // คำสั่งที่ให้ทำงานอัตโนมัติเมื่อสั่ง 'npx prisma db seed'
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // อ่าน Connection String ของฐานข้อมูลจาก .env
    url: process.env["DATABASE_URL"],
  },
});
