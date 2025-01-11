import {storage} from '@utils/Storage';
import {MMKV} from 'react-native-mmkv';
import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';

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

export enum ToastType {
  ERROR = 'error',
  SUCCESS = 'success',
}

interface GlobalState {
  authToken: string | null;
  setAuthToken: (token: string) => void;
  toastVisible: boolean;
  toastTitle: string | null;
  toastMessage: string | null;
  toastType: ToastType | null;
  showToast(title: string, message: string, type: ToastType): void;
  hideToast(): void;
  setTagScanned: (medicationId: string | null) => void;
  tagScanned: string | null;
  appReady: boolean;
  setAppReady: (ready: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set, get) => ({
      authToken: null,
      appReady: false,
      setAppReady: ready => set({appReady: ready}),
      setAuthToken: token => set({authToken: token}),
      tagScanned: null,
      setTagScanned: medicationId => {
        set({tagScanned: medicationId});
      },
      toastVisible: false,
      toastTitle: null,
      toastMessage: null,
      toastType: null,
      showToast(title, message, type) {
        set({
          toastVisible: true,
          toastTitle: title,
          toastMessage: message,
          toastType: type,
        });
      },
      hideToast: () =>
        set({
          toastVisible: false,
          toastTitle: null,
          toastMessage: null,
          toastType: null,
        }),
    }),
    {
      name: 'scriptag-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
