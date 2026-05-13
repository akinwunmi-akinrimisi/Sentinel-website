import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  isBookingOpen: boolean
  isMenuOpen: boolean
  openBooking: () => void
  closeBooking: () => void
  toggleMenu: () => void
  closeMenu: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isBookingOpen: false,
      isMenuOpen: false,
      openBooking: () => set({ isBookingOpen: true }),
      closeBooking: () => set({ isBookingOpen: false }),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      closeMenu: () => set({ isMenuOpen: false }),
    }),
    { name: 'sentinel-ui' }
  )
)
