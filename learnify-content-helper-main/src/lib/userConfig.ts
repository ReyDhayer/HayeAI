import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserConfig {
  name: string;
  displayName: string;
  displayNameType: 'name' | 'nickname';
  avatar: string;
  setName: (name: string) => void;
  setDisplayName: (displayName: string) => void;
  setDisplayNameType: (type: 'name' | 'nickname') => void;
  setAvatar: (avatar: string) => void;
}

export const useUserConfig = create<UserConfig>()(
  persist(
    (set) => ({
      name: '',
      displayName: '',
      displayNameType: 'name',
      avatar: '',
      setName: (name) => set({ name }),
      setDisplayName: (displayName) => set({ displayName }),
      setDisplayNameType: (type) => set({ displayNameType: type }),
      setAvatar: (avatar) => set({ avatar }),
    }),
    {
      name: 'user-config',
    }
  )
);