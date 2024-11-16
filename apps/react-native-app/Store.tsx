import {MMKV} from 'react-native-mmkv';
import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';

const storage = new MMKV();

const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: name => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: name => {
    return storage.delete(name);
  },
};

interface GlobalState {
  authToken: string | null;
  setAuthToken: (token: string) => void;
  toastVisible: boolean;
  toastTitle: string | null;
  toastMessage: string | null;
  showToast(title: string, message: string): void;
  hideToast(): void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      authToken: null,
      setAuthToken: token => set({authToken: token}),
      toastVisible: false,
      toastTitle: null,
      toastMessage: null,
      showToast(title, message) {
        set({
          toastVisible: true,
          toastTitle: title,
          toastMessage: message,
        });
      },
      hideToast: () =>
        set({
          toastVisible: false,
          toastTitle: null,
          toastMessage: null,
        }),
    }),
    {
      name: 'scriptag-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
