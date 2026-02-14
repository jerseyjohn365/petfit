import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineAction } from '../types';

interface OfflineStore {
  queue: OfflineAction[];
  addAction: (action: Omit<OfflineAction, 'id' | 'created_at'>) => void;
  removeAction: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set) => ({
      queue: [],
      addAction: (action) =>
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...action,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              created_at: Date.now(),
            },
          ],
        })),
      removeAction: (id) =>
        set((state) => ({
          queue: state.queue.filter((a) => a.id !== id),
        })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'petfit-offline-queue',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
