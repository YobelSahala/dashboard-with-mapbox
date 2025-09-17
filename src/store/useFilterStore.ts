import { create } from 'zustand';

interface FilterStore {
  category: string;
  status: string;
  search: string;
  setCategory: (category: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  category: '',
  status: '',
  search: '',
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  clearFilters: () => set({ category: '', status: '', search: '' }),
}));