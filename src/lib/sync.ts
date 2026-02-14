import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../store/offlineStore';
import { supabase } from './supabase';
import { OfflineAction } from '../types';

export async function processOfflineQueue(): Promise<void> {
  const store = useOfflineStore.getState();
  const queue = store.queue;

  if (queue.length === 0) return;

  for (const action of queue) {
    try {
      await processAction(action);
      store.removeAction(action.id);
    } catch (error) {
      console.error('Failed to process offline action:', action.id, error);
      break; // Stop on first failure to maintain order
    }
  }
}

async function processAction(action: OfflineAction): Promise<void> {
  switch (action.type) {
    case 'weigh_in': {
      const { error } = await supabase.from('weigh_ins').insert(action.payload);
      if (error) throw error;
      break;
    }
    case 'feeding_log': {
      const { error } = await supabase.from('feeding_logs').insert(action.payload);
      if (error) throw error;
      break;
    }
  }
}

export function setupConnectivityListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      processOfflineQueue();
    }
  });

  return unsubscribe;
}
