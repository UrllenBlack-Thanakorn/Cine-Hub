import { useQuery } from "@tanstack/react-query";
import { useMovieFilterStore, useRegisterModalStore } from "./store";
import { RegisterModal } from "./RegisterModal";
import type { MovieItem } from "./types";

const GENRES = ["ALL", "Sci-Fi", "Action", "Animation", "Drama"];

// API Fetcher function สำหรับ TanStack Query
const fetchMovies = async (genre: string): Promise<MovieItem[]> => {
  const res = await fetch(
    `http://localhost:3000/api/movies?genre=${encodeURIComponent(genre)}`,
  );
  if (!res.ok) {
    throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend (Port 3000) ได้");
  }
  const json = await res.json();
  return json.data || [];
};

export default function App() {
  // Zustand State Management: ดึงค่า state และ action
  const { selectedGenre, setSelectedGenre } = useMovieFilterStore();
  const { openModal } = useRegisterModalStore();

  // TanStack Query: จัดการ Server State (Data fetching, caching, loading, error)
  const {
    data: movies = [],
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["movies", selectedGenre],
    queryFn: () => fetchMovies(selectedGenre),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Prompt',sans-serif]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
              🎬
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                CineHub Movie Catalog
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                TanStack Query + Zustand + Tailwind CSS + Express &amp; Prisma 7
              </p>
            </div>
          </div>

          <button
            onClick={openModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <span>👤</span>
            <span>ลงทะเบียน / ทดสอบ Validation</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Genre Filter & Subheader */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <span>คลังภาพยนตร์ในระบบ</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {movies.length} เรื่อง
              </span>
              {isFetching && !isLoading && (
                <span className="text-xs text-sky-400 font-normal animate-pulse flex items-center space-x-1">
                  <span>⚡</span>
                  <span>กำลังรีเฟรชแคช...</span>
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              คลิกหมวดหมู่เพื่อเปลี่ยน Zustand State และให้ TanStack Query
              ดึงข้อมูลพร้อมทำ Auto-Caching
            </p>
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const active = selectedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400/30"
                      : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  {genre === "ALL" ? "🌟 ทั้งหมด" : genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Spinner with TanStack Query */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm animate-pulse">
              กำลังดึงข้อมูลภาพยนตร์ผ่าน TanStack Query...
            </p>
          </div>
        )}

        {/* Error Alert Box */}
        {isError && (
          <div className="max-w-xl mx-auto my-12 p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center">
            <span className="text-4xl block mb-2">⚠️</span>
            <h3 className="text-lg font-bold text-rose-400">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </h3>
            <p className="text-rose-300/90 text-sm mt-1">
              {(error as Error).message}
            </p>
            <p className="text-slate-500 text-xs mt-3">
              ตรวจสอบว่าได้รัน{" "}
              <code className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                npm run dev
              </code>{" "}
              ที่โฟลเดอร์ <code>cinehub-server</code> (Port 3000) แล้วหรือยัง
            </p>
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Poster Frame */}
                <div className="relative h-56 bg-slate-950 overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                      ไม่มีภาพโปสเตอร์
                    </div>
                  )}

                  {/* Badges Over Poster */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-sky-300 border border-sky-400/30">
                    {movie.genre}
                  </span>

                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 flex items-center space-x-1">
                    <span>⭐</span>
                    <span>
                      {movie.averageRating > 0
                        ? `${movie.averageRating}/10`
                        : "ยังไม่มีคะแนน"}
                    </span>
                  </span>
                </div>

                {/* Movie Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {movie.title}{" "}
                      <span className="text-sm font-normal text-slate-400">
                        ({movie.releaseYear})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      🎥 ผู้กำกับ:{" "}
                      <strong className="text-slate-300">
                        {movie.director}
                      </strong>{" "}
                      • ⏱️ {movie.durationMin} นาที
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300/90 mt-3 line-clamp-3 leading-relaxed">
                      {movie.synopsis || "ไม่มีเรื่องย่อ"}
                    </p>
                  </div>

                  {/* Reviews & Watchlist Counter */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>
                        📌 Watchlist:{" "}
                        <strong className="text-sky-400">
                          {movie._count.watchlists}
                        </strong>{" "}
                        คน
                      </span>
                      <span>
                        💬 รีวิว:{" "}
                        <strong className="text-sky-400">
                          {movie._count.reviews}
                        </strong>{" "}
                        รายการ
                      </span>
                    </div>

                    {movie.reviews.length > 0 && (
                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                        <div className="flex justify-between items-center text-slate-300 font-semibold mb-1">
                          <span className="text-sky-400">
                            {movie.reviews[0].user.name}
                          </span>
                          <span className="text-amber-400">
                            ★ {movie.reviews[0].rating}/10
                          </span>
                        </div>
                        <p className="text-slate-400 italic line-clamp-2">
                          "{movie.reviews[0].comment}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal ลงทะเบียน แยก Component เชื่อมกับ Zustand และ TanStack useMutation */}
      <RegisterModal />
    </div>
  );
}
