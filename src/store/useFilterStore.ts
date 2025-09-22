import { create } from 'zustand';

interface FilterStore {
  category: string;
  status: string;
  search: string;
  apn: string;
  mapType: string;
  setCategory: (category: string) => void;
  setStatus: (status: string) => void;
  setSearch: (search: string) => void;
  setApn: (apn: string) => void;
  setMapType: (mapType: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  category: '',
  status: '',
  search: '',
  apn: '',
  mapType: 'Basic',
  setCategory: (category) => set({ category }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  setApn: (apn) => set({ apn }),
  setMapType: (mapType) => set({ mapType }),
  clearFilters: () => set({ category: '', status: '', search: '', apn: '', mapType: 'Basic' }),
}));