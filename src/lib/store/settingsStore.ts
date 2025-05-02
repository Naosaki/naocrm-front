import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type SettingsState = {
  logo: string | null
  setLogo: (logo: string | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      logo: null,
      setLogo: (logo: string | null) => set({ logo }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
