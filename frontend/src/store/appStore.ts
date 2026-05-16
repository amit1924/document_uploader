import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';
type ViewMode = 'grid' | 'list';
type FileCategory = string | null;

interface AppState {
  sidebarOpen: boolean;
  theme: Theme;
  viewMode: ViewMode;
  selectedCategory: FileCategory;
  searchQuery: string;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedCategory: (category: FileCategory) => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      viewMode: 'grid',
      selectedCategory: null,
      searchQuery: '',

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (sidebarOpen) =>
        set({ sidebarOpen }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),

      setTheme: (theme) =>
        set({ theme }),

      setViewMode: (viewMode) =>
        set({ viewMode }),

      setSelectedCategory: (selectedCategory) =>
        set({ selectedCategory }),

      setSearchQuery: (searchQuery) =>
        set({ searchQuery }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
