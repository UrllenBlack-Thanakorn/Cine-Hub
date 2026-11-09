/**
 * ============================================================================
 * ไฟล์: prisma/seed.ts
 * คำอธิบาย: สคริปต์สำหรับจำลองข้อมูลเริ่มต้น (Mock Data / Seed Data) ลงฐานข้อมูล
 * ============================================================================
 */

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

// เชื่อมต่อ PostgreSQL เข้ากับ Prisma Client สำหรับการ Seed
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🎬 Starting CineHub database seed with movies and users...");

  // -------------------------------------------------------------
  // ขั้นตอนที่ 1: ล้างข้อมูลเก่าในตารางทิ้งทั้งหมด (Clean slate)
  // ลบจากตารางลูก (Child) ไปหาตารางแม่ (Parent) เพื่อไม่ให้ติด FK Constraint
  // -------------------------------------------------------------
  console.log("🧹 Clearing old records...");
  await prisma.movieReview.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  // -------------------------------------------------------------
  // ขั้นตอนที่ 2: สร้างข้อมูลผู้ใช้ตัวอย่าง (User Records)
  // -------------------------------------------------------------
  console.log("👤 Creating sample users...");
  const memberUser = await prisma.user.create({
    data: {
      email: "somchai@cinehub.com",
      name: "Somchai MovieLover",
      tel: "081-234-5678",
      role: Role.USER,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "critic@cinehub.com",
      name: "Suda FilmCritic",
      tel: "089-876-5432",
      role: Role.ADMIN,
    },
  });

  // ข้อมูลนักศึกษาผู้จัดทำ
  const studentUser = await prisma.user.create({
    data: {
      email: "thanakorn.kasa@bu.ac.th",
      name: "Thanakorn Kasaiklang",
      tel: "089-999-8877",
      role: Role.USER,
    },
  });

  // -------------------------------------------------------------
  // ขั้นตอนที่ 3: สร้าง Movies (รวม Spider-Man: Across the Spider-Verse)
  // -------------------------------------------------------------
  console.log("🎞️ Creating 6 sample movies...");
  const moviesData = [
    {
      title: "Spider-Man: Across the Spider-Verse",
      director: "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
      genre: "Animation",
      releaseYear: 2023,
      durationMin: 140,
      synopsis:
        "ไมล์ส มอราลเลส กลับมาอีกครั้งในการผจญภัยข้ามมัลติเวิร์สเพื่อปกป้องความปลอดภัยของโลก",
      posterUrl:
        "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500",
    },
    {
      title: "Inception",
      director: "Christopher Nolan",
      genre: "Sci-Fi",
      releaseYear: 2010,
      durationMin: 148,
      synopsis:
        "ดอม คอบบ์ หัวขโมยมืออาชีพผู้เชี่ยวชาญการดึงข้อมูลจากจิตใต้สำนึกในระหว่างที่เป้าหมายกำลังฝัน",
      posterUrl:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500",
    },
    {
      title: "Interstellar",
      director: "Christopher Nolan",
      genre: "Sci-Fi",
      releaseYear: 2014,
      durationMin: 169,
      synopsis:
        "ทีมนักสำรวจอวกาศเดินทางผ่านรูหนอนเพื่อค้นหาดาวเคราะห์ดวงใหม่สำหรับมนุษยชาติ",
      posterUrl:
        "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500",
    },
    {
      title: "The Dark Knight",
      director: "Christopher Nolan",
      genre: "Action",
      releaseYear: 2008,
      durationMin: 152,
      synopsis:
        "แบทแมนต้องเผชิญหน้ากับโจ๊กเกอร์ อาชญากรอัจฉริยะที่ต้องการปั่นหัวเมืองก็อตแธมให้ตกอยู่ในความโกลาหล",
      posterUrl:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500",
    },
    {
      title: "Spirited Away",
      director: "Hayao Miyazaki",
      genre: "Animation",
      releaseYear: 2001,
      durationMin: 125,
      synopsis:
        "จิฮิโระ เด็กสาววัย 10 ขวบที่หลงเข้าไปในโลกแห่งวิญญาณและต้องหาทางช่วยพ่อแม่ที่ถูกสาปเป็นหมู",
      posterUrl:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500",
    },
    {
      title: "Parasite",
      director: "Bong Joon-ho",
      genre: "Drama",
      releaseYear: 2019,
      durationMin: 132,
      synopsis:
        "เรื่องราวเสียดสีสังคมเมื่อครอบครัวฐานะยากจนค่อยๆ แทรกซึมเข้าไปทำงานในบ้านของครอบครัวเศรษฐี",
      posterUrl:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
    },
  ];

  const createdMovies: any[] = [];
  for (const m of moviesData) {
    const created = await prisma.movie.create({ data: m });
    createdMovies.push(created);
  }

  // -------------------------------------------------------------
  // ขั้นตอนที่ 4: สร้าง Watchlists
  // -------------------------------------------------------------
  console.log("📌 Creating watchlists...");
  await prisma.watchlist.createMany({
    data: [
      { userId: memberUser.id, movieId: createdMovies[0].id }, // Spider-Man
      { userId: memberUser.id, movieId: createdMovies[1].id }, // Inception
      { userId: memberUser.id, movieId: createdMovies[2].id }, // Interstellar
      { userId: adminUser.id, movieId: createdMovies[4].id },  // Spirited Away
      { userId: studentUser.id, movieId: createdMovies[0].id }, // Spider-Man
    ],
  });

  // -------------------------------------------------------------
  // ขั้นตอนที่ 5: สร้าง MovieReviews
  // -------------------------------------------------------------
  console.log("⭐ Creating movie reviews...");
  await prisma.movieReview.createMany({
    data: [
      {
        userId: memberUser.id,
        movieId: createdMovies[0].id, // Spider-Man
        rating: 10,
        comment: "แอนิเมชันสวยงาม ตระการตา เนื้อเรื่องล้ำยุคมากครับ",
      },
      {
        userId: memberUser.id,
        movieId: createdMovies[1].id, // Inception
        rating: 10,
        comment:
          "ฉากเมืองพับได้และแนวคิดฝันซ้อนฝันสุดยอดมากครับ เป็นหนังขึ้นหิ้งจริงๆ",
      },
      {
        userId: adminUser.id,
        movieId: createdMovies[1].id, // Inception
        rating: 9,
        comment: "ดนตรีประกอบของ Hans Zimmer ทำให้ลุ้นระทึกทุกวินาที",
      },
      {
        userId: memberUser.id,
        movieId: createdMovies[2].id, // Interstellar
        rating: 10,
        comment:
          "อธิบายทฤษฎีสัมพัทธภาพและหลุมดำออกมาเป็นภาพที่สวยงามและซึ้งกินใจมาก",
      },
      {
        userId: memberUser.id,
        movieId: createdMovies[5].id, // Parasite
        rating: 9,
        comment: "บทภาพยนตร์หักมุมและสะท้อนความเหลื่อมล้ำได้เฉียบคมสุดๆ",
      },
      {
        userId: studentUser.id,
        movieId: createdMovies[0].id, // Spider-Man
        rating: 10,
        comment: "ชอบกราฟิกและลูกเล่น multiverse มาก สมบูรณ์แบบทุกจุด!",
      },
    ],
  });

  console.log(
    "✅ Seed completed successfully! Added 6 movies with reviews, watchlists and student user.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
