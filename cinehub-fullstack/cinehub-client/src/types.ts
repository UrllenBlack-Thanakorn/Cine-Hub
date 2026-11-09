export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  user: { id: number; name: string };
}

export interface MovieItem {
  id: number;
  title: string;
  director: string;
  genre: string;
  releaseYear: number;
  durationMin: number;
  synopsis: string | null;
  posterUrl: string | null;
  averageRating: number;
  reviews: ReviewItem[];
  _count: {
    watchlists: number;
    reviews: number;
  };
}

export interface UserFormData {
  name: string;
  email: string;
  tel: string;
  role: "USER" | "ADMIN";
}
