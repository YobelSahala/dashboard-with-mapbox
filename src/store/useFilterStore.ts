import { create } from 'zustand';

interface FilterStore {
  category: string;
  status: string;
  search: string;
  apn: string;
  setCategory: (category: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  setApn: (apn: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  category: '',
  status: '',
  search: '',
  apn: '',
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  setApn: (apn) => set({ apn }),
  clearFilters: () => set({ category: '', status: '', search: '', apn: '' }),
}));