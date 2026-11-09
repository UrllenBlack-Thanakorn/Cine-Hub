import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { prisma } from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/*
=============================================================================
  CineHub RESTful API - Function & Endpoint Outline:
  ---------------------------------------------------------------------------
  1. GET    /api/movies        : ดึงภาพยนตร์ทั้งหมด (รองรับ ?genre=...)
  2. GET    /api/movies/:id    : ดึงภาพยนตร์รายเรื่องตาม ID พร้อมรีวิว
  3. POST   /api/movies        : เพิ่มภาพยนตร์เรื่องใหม่ (Create Movie)
  4. PUT    /api/movies/:id    : แก้ไขข้อมูลภาพยนตร์เดิม (Update Movie)
  5. DELETE /api/movies/:id    : ลบภาพยนตร์ตาม ID พร้อมความสัมพันธ์ (Delete Movie)
  -- Schema: createUserSchema (Zod) : กำหนด Schema สำหรับตรวจสอบข้อมูล User ด้วย Zod
  6. GET    /api/users         : ดึงรายชื่อผู้ใช้ทั้งหมด (User List พร้อม tel)
  7. POST   /api/users         : เพิ่มผู้ใช้ใหม่พร้อม Zod Validation และเช็ค Email ซ้ำ
=============================================================================
*/

// -------------------------------------------------------------
// 1. GET /api/movies - ดึงรายการภาพยนตร์ทั้งหมด (รองรับ ?genre=...)
// -------------------------------------------------------------
app.get("/api/movies", async (req: Request, res: Response) => {
  try {
    const { genre } = req.query;

    const movies = await prisma.movie.findMany({
      where:
        typeof genre === "string" && genre !== "ALL"
          ? { genre: { equals: genre, mode: "insensitive" } }
          : undefined,
      include: {
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { watchlists: true, reviews: true },
        },
      },
      orderBy: { releaseYear: "desc" },
    });

    const moviesWithStats = movies.map((movie) => {
      const totalReviews = movie.reviews.length;
      const sumRating = movie.reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating =
        totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

      return {
        ...movie,
        averageRating,
      };
    });

    res.json({
      success: true,
      count: moviesWithStats.length,
      data: moviesWithStats,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
});

// -------------------------------------------------------------
// 2. GET /api/movies/:id - ดึงภาพยนตร์รายเรื่องตาม ID
// -------------------------------------------------------------
app.get("/api/movies/:id", async (req: Request, res: Response) => {
  try {
    const movieId = Number(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ success: false, message: "ID ไม่ถูกต้อง" });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { watchlists: true, reviews: true },
        },
      },
    });

    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: `ไม่พบภาพยนตร์ ID: ${movieId}` });
    }

    const totalReviews = movie.reviews.length;
    const sumRating = movie.reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

    res.json({
      success: true,
      data: { ...movie, averageRating },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการค้นหาข้อมูล" });
  }
});

// -------------------------------------------------------------
// 3. POST /api/movies - เพิ่มภาพยนตร์เรื่องใหม่ (Create)
// -------------------------------------------------------------
app.post("/api/movies", async (req: Request, res: Response) => {
  try {
    const {
      title,
      director,
      genre,
      releaseYear,
      durationMin,
      synopsis,
      posterUrl,
    } = req.body;

    // ตรวจสอบ Validation เบื้องต้น
    if (!title || !director || !genre || !releaseYear) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ title, director, genre และ releaseYear ให้ครบถ้วน",
      });
    }

    const newMovie = await prisma.movie.create({
      data: {
        title,
        director,
        genre,
        releaseYear: Number(releaseYear),
        durationMin: durationMin ? Number(durationMin) : 120,
        synopsis: synopsis || null,
        posterUrl: posterUrl || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "สร้างภาพยนตร์สำเร็จ",
      data: newMovie,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกภาพยนตร์" });
  }
});

// -------------------------------------------------------------
// 4. PUT /api/movies/:id - อัปเดตข้อมูลภาพยนตร์เดิม (Update)
// -------------------------------------------------------------
app.put("/api/movies/:id", async (req: Request, res: Response) => {
  try {
    const movieId = Number(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ success: false, message: "ID ไม่ถูกต้อง" });
    }

    const {
      title,
      director,
      genre,
      releaseYear,
      durationMin,
      synopsis,
      posterUrl,
    } = req.body;

    // ตรวจสอบว่ามีหนังเรื่องนี้อยู่ในระบบหรือไม่
    const existing = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: `ไม่พบภาพยนตร์ ID: ${movieId}` });
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        title: title !== undefined ? title : existing.title,
        director: director !== undefined ? director : existing.director,
        genre: genre !== undefined ? genre : existing.genre,
        releaseYear:
          releaseYear !== undefined
            ? Number(releaseYear)
            : existing.releaseYear,
        durationMin:
          durationMin !== undefined
            ? Number(durationMin)
            : existing.durationMin,
        synopsis: synopsis !== undefined ? synopsis : existing.synopsis,
        posterUrl: posterUrl !== undefined ? posterUrl : existing.posterUrl,
      },
    });

    res.json({
      success: true,
      message: "อัปเดตข้อมูลภาพยนตร์เรียบร้อย",
      data: updatedMovie,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการอัปเดตภาพยนตร์" });
  }
});

// -------------------------------------------------------------
// 5. DELETE /api/movies/:id - ลบภาพยนตร์ (Delete)
// -------------------------------------------------------------
app.delete("/api/movies/:id", async (req: Request, res: Response) => {
  try {
    const movieId = Number(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ success: false, message: "ID ไม่ถูกต้อง" });
    }

    // ตรวจสอบว่ามีภาพยนตร์อยู่หรือไม่
    const existing = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: `ไม่พบภาพยนตร์ ID: ${movieId}` });
    }

    // ลบภาพยนตร์ (Cascade จะลบ Reviews และ Watchlists ที่ผูกไว้ให้อัตโนมัติ)
    await prisma.movie.delete({
      where: { id: movieId },
    });

    res.json({
      success: true,
      message: `ลบภาพยนตร์เรื่อง '${existing.title}' (ID: ${movieId}) สำเร็จ`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูล" });
  }
});

// -------------------------------------------------------------
// Zod Schema: กำหนด Schema สำหรับตรวจสอบความถูกต้องของข้อมูล User
// -------------------------------------------------------------
const createUserSchema = z.object({
  // 1. ตรวจสอบ email
  email: z
    .string({ required_error: "กรุณาระบุ email" })
    .trim()
    .min(1, "กรุณาระบุ email")
    .email("รูปแบบ email ไม่ถูกต้องตามมาตรฐาน (เช่น user@example.com)"),

  // 2. ตรวจสอบชื่อ (name)
  name: z
    .string({ required_error: "กรุณาระบุ name" })
    .trim()
    .min(1, "กรุณาระบุ name")
    .min(2, "name ต้องมีความยาวระหว่าง 2 ถึง 100 ตัวอักษร")
    .max(100, "name ต้องมีความยาวระหว่าง 2 ถึง 100 ตัวอักษร"),

  // 3. ตรวจสอบเบอร์โทรศัพท์ (tel) เป็นเบอร์มือถือไทย เช่น 081-234-5678 (Optional)
  tel: z
    .string()
    .trim()
    .refine(
      (val) =>
        !val || /^0[689]\d(-?\d{3}-?\d{4}|-?\d{4}-?\d{3}|\d{7})$/.test(val),
      {
        message:
          "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นเบอร์มือถือที่ถูกต้อง เช่น 081-234-5678)",
      },
    )
    .optional()
    .nullable(),

  // 4. ตรวจสอบ Role ต้องเป็น 'USER' หรือ 'ADMIN'
  role: z
    .enum(["USER", "ADMIN"], {
      errorMap: () => ({
        message: "role ต้องเป็น 'USER' หรือ 'ADMIN' เท่านั้น",
      }),
    })
    .optional()
    .default("USER"),
});

type CreateUserInput = z.infer;

// -------------------------------------------------------------
// 6. GET /api/users - ดึงรายชื่อผู้ใช้ทั้งหมด (User List)
// -------------------------------------------------------------
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { watchlists: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
});

// -------------------------------------------------------------
// 7. POST /api/users - เพิ่มผู้ใช้ใหม่ พร้อมระบบ Zod Validation
// -------------------------------------------------------------
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    // 1. ตรวจสอบ Validation ด้วย Zod safeParse
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0].message,
      });
    }

    const { email, name, tel, role } = parsed.data;

    // 2. ตรวจสอบว่า email ซ้ำในระบบหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `อีเมล '${email}' มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น`,
      });
    }

    // 3. สร้าง User ใหม่ลงฐานข้อมูล
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        tel: tel || null,
        role,
      },
    });

    res.status(201).json({
      success: true,
      message: "สร้างผู้ใช้ใหม่สำเร็จ",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "เกิดข้อผิดพลาดในการสร้างผู้ใช้" });
  }
});

// เริ่มทำงาน Server
app.listen(PORT, () => {
  console.log(`🚀 CineHub Backend running on http://localhost:${PORT}`);
});
