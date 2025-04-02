import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InventoryRecognitionResult } from '@/types/inventory';

type OfflineImageRequest = {
  id: string;
  imageData: string;
  timestamp: number;
  scanMode: 'single' | 'shelf';
  processed: boolean;
};

type OfflineInventoryCount = {
  id: string;
  productId: string;
  count: number;
  countedAt: string;
  countMethod: 'camera' | 'video' | 'manual';
  notes?: string;
  synced: boolean;
};

type ConnectionStatus = 'online' | 'offline' | 'syncing';

interface OfflineState {
  // Connection status tracking
  connectionStatus: ConnectionStatus;
  lastOnlineAt: number | null;
  
  // Queue management
  pendingImageRequests: OfflineImageRequest[];
  pendingInventoryCounts: OfflineInventoryCount[];
  recognizedItemsCache: Record<string, InventoryRecognitionResult[]>;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  addPendingImageRequest: (imageData: string, scanMode: 'single' | 'shelf') => string;
  markImageRequestProcessed: (id: string) => void;
  addInventoryCount: (count: Omit<OfflineInventoryCount, 'id' | 'synced'>) => void;
  markInventoryCountSynced: (id: string) => void;
  cacheRecognizedItems: (requestId: string, items: InventoryRecognitionResult[]) => void;
  getRecognizedItems: (requestId: string) => InventoryRecognitionResult[] | null;
  clearSyncedData: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      connectionStatus: navigator.onLine ? 'online' : 'offline',
      lastOnlineAt: navigator.onLine ? Date.now() : null,
      pendingImageRequests: [],
      pendingInventoryCounts: [],
      recognizedItemsCache: {},

      setConnectionStatus: (status) => {
        set({ 
          connectionStatus: status,
          ...(status === 'online' ? { lastOnlineAt: Date.now() } : {})
        });
      },

      addPendingImageRequest: (imageData, scanMode) => {
        const id = `img-req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        set((state) => ({
          pendingImageRequests: [
            ...state.pendingImageRequests,
            {
              id,
              imageData,
              timestamp: Date.now(),
              scanMode,
              processed: false
            }
          ]
        }));
        return id;
      },

      markImageRequestProcessed: (id) => {
        set((state) => ({
          pendingImageRequests: state.pendingImageRequests.map(req => 
            req.id === id ? { ...req, processed: true } : req
          )
        }));
      },

      addInventoryCount: (count) => {
        const id = `inv-count-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        set((state) => ({
          pendingInventoryCounts: [
            ...state.pendingInventoryCounts,
            {
              id,
              ...count,
              synced: false
            }
          ]
        }));
      },

      markInventoryCountSynced: (id) => {
        set((state) => ({
          pendingInventoryCounts: state.pendingInventoryCounts.map(count => 
            count.id === id ? { ...count, synced: true } : count
          )
        }));
      },

      cacheRecognizedItems: (requestId, items) => {
        set((state) => ({
          recognizedItemsCache: {
            ...state.recognizedItemsCache,
            [requestId]: items
          }
        }));
      },

      getRecognizedItems: (requestId) => {
        return get().recognizedItemsCache[requestId] || null;
      },

      clearSyncedData: () => {
        set((state) => ({
          pendingImageRequests: state.pendingImageRequests.filter(req => !req.processed),
          pendingInventoryCounts: state.pendingInventoryCounts.filter(count => !count.synced),
          // Keep only cache entries that are still referenced by pending requests
          recognizedItemsCache: Object.fromEntries(
            Object.entries(state.recognizedItemsCache).filter(([key]) => 
              state.pendingImageRequests.some(req => !req.processed && req.id === key)
            )
          )
        }));
      }
    }),
    {
      name: 'inventory-offline-storage',
    }
  )
);
