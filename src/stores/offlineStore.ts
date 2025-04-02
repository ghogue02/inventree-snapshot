
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OfflineItem {
  id: string;
  type: 'inventory_count' | 'invoice' | 'product';
  createdAt: Date;
  data: any;
}

export interface OfflineState {
  items: OfflineItem[];
  addItem: (item: OfflineItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter(item => item.id !== id)
      })),
      clearItems: () => set({ items: [] })
    }),
    {
      name: 'offline-storage'
    }
  )
);
