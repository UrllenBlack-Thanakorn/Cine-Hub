import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// โหลดค่า DATABASE_URL จากไฟล์ .env
dotenv.config();

// 1. สร้าง Connection Pool เชื่อมต่อไปยัง PostgreSQL (รองรับหลายคำขอพร้อมกัน)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. หุ้ม pg Pool ด้วย Driver Adapter ของ Prisma 7
const adapter = new PrismaPg(pool);

// 3. สร้างและ export PrismaClient ตัวเดียว (Single Instance) ไปใช้ทั่วทั้งโปรเจกต์
export const prisma = new PrismaClient({ adapter });
