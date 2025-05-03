import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SettingsState = {
  logo: string | null
  setLogo: (logo: string | null) => void
  loginImage: string | null
  setLoginImage: (loginImage: string | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      logo: null,
      setLogo: (logo: string | null) => set({ logo }),
      loginImage: null,
      setLoginImage: (loginImage: string | null) => set({ loginImage }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
