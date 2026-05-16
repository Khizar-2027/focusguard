import { create } from 'zustand';

const useTimerStore = create((set, get) => ({
  activeTimer: null, // 'study' | 'reels' | 'break' | null
  elapsed: 0,
  intervalId: null,

  startTimer: (type) => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);

    const id = setInterval(() => {
      set((state) => ({ elapsed: state.elapsed + 1 }));
    }, 1000);

    set({ activeTimer: type, elapsed: 0, intervalId: id });
  },

  stopTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    const elapsed = get().elapsed;
    const type = get().activeTimer;
    set({ activeTimer: null, elapsed: 0, intervalId: null });
    return { elapsed, type };
  },

  resetTimer: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ activeTimer: null, elapsed: 0, intervalId: null });
  },
}));

export default useTimerStore;