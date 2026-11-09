import { create } from "zustand";

interface MovieFilterState {
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
}

interface RegisterModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useMovieFilterStore = create<MovieFilterState>((set) => ({
  selectedGenre: "ALL",
  setSelectedGenre: (genre) => set({ selectedGenre: genre }),
}));

export const useRegisterModalStore = create<RegisterModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
