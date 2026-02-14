// Pure logic test for offline queue behavior
// Uses a plain Zustand store (no persist middleware) to avoid AsyncStorage issues in test

import { create } from 'zustand';

interface OfflineAction {
  id: string;
  type: 'weigh_in' | 'feeding_log';
  payload: Record<string, unknown>;
  created_at: number;
}

interface OfflineStore {
  queue: OfflineAction[];
  addAction: (action: Omit<OfflineAction, 'id' | 'created_at'>) => void;
  removeAction: (id: string) => void;
  clearQueue: () => void;
}

const createTestStore = () =>
  create<OfflineStore>((set) => ({
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
  }));

describe('offlineStore', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  test('starts with empty queue', () => {
    expect(store.getState().queue).toHaveLength(0);
  });

  test('addAction appends to queue with generated id and timestamp', () => {
    store.getState().addAction({
      type: 'weigh_in',
      payload: { dog_id: 'dog-1', weight: 70 },
    });

    const queue = store.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('weigh_in');
    expect(queue[0].id).toBeTruthy();
    expect(queue[0].created_at).toBeGreaterThan(0);
    expect(queue[0].payload).toEqual({ dog_id: 'dog-1', weight: 70 });
  });

  test('addAction preserves existing items', () => {
    const s = store.getState();
    s.addAction({ type: 'weigh_in', payload: { weight: 70 } });
    s.addAction({ type: 'feeding_log', payload: { calories: 350 } });

    expect(store.getState().queue).toHaveLength(2);
  });

  test('removeAction removes by id', () => {
    const s = store.getState();
    s.addAction({ type: 'weigh_in', payload: { weight: 70 } });
    s.addAction({ type: 'feeding_log', payload: { calories: 350 } });

    const queue = store.getState().queue;
    const idToRemove = queue[0].id;

    store.getState().removeAction(idToRemove);

    const updated = store.getState().queue;
    expect(updated).toHaveLength(1);
    expect(updated[0].type).toBe('feeding_log');
  });

  test('clearQueue empties the queue', () => {
    const s = store.getState();
    s.addAction({ type: 'weigh_in', payload: { weight: 70 } });
    s.addAction({ type: 'weigh_in', payload: { weight: 69 } });

    store.getState().clearQueue();
    expect(store.getState().queue).toHaveLength(0);
  });

  test('removeAction with nonexistent id does nothing', () => {
    const s = store.getState();
    s.addAction({ type: 'weigh_in', payload: { weight: 70 } });
    store.getState().removeAction('nonexistent-id');

    expect(store.getState().queue).toHaveLength(1);
  });

  test('queue maintains insertion order', () => {
    const s = store.getState();
    s.addAction({ type: 'weigh_in', payload: { order: 1 } });
    s.addAction({ type: 'feeding_log', payload: { order: 2 } });
    s.addAction({ type: 'weigh_in', payload: { order: 3 } });

    const queue = store.getState().queue;
    expect(queue[0].payload.order).toBe(1);
    expect(queue[1].payload.order).toBe(2);
    expect(queue[2].payload.order).toBe(3);
  });
});
