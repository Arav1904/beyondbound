import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  },
};

const useMenuStore = create(
  persist(
    (set) => ({
      // Initial State
      activeMenu: null,
      activePage: 'home',
      isLoginModalOpen: false,
      authMode: 'login', // 'login' or 'signup'
      signedInUser: null,
      isAccountModalOpen: false,
      accountModalSection: 'profile',
      accountProfile: DEFAULT_PROFILE,

      // Actions to update state
      setActiveMenu: (menuName) => set({ activeMenu: menuName }),
      setActivePage: (pageName) => set({ activePage: pageName, activeMenu: null }),
      setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      setAuthMode: (mode) => set({ authMode: mode }),
      setSignedInUser: (user) =>
        set((state) => {
          if (!user) {
            return { signedInUser: null };
          }

          return {
            signedInUser: user,
            accountProfile: {
              ...state.accountProfile,
              name: state.accountProfile.name || user.name || '',
              email: user.email || state.accountProfile.email || '',
            },
          };
        }),
      openAccountModal: (section = 'profile') =>
        set({
          isAccountModalOpen: true,
          accountModalSection: section,
          isLoginModalOpen: false,
        }),
      setIsAccountModalOpen: (isOpen) => set({ isAccountModalOpen: isOpen }),
      setAccountModalSection: (section) => set({ accountModalSection: section }),
      updateAccountProfile: (updates) =>
        set((state) => {
          const nextProfile = {
            ...state.accountProfile,
            ...updates,
            address: {
              ...state.accountProfile.address,
              ...(updates.address || {}),
            },
          };

          return {
            accountProfile: nextProfile,
            signedInUser: state.signedInUser
              ? {
                  ...state.signedInUser,
                  name: nextProfile.name || state.signedInUser.name,
                }
              : state.signedInUser,
          };
        }),
      logout: () =>
        set({
          signedInUser: null,
          isLoginModalOpen: false,
          isAccountModalOpen: false,
          accountModalSection: 'profile',
          accountProfile: DEFAULT_PROFILE,
          authMode: 'login',
        }),

      // Optional: A reset function
      clearMenu: () => set({ activeMenu: null }),
    }),
    {
      name: 'beyond-bound-ui-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        signedInUser: state.signedInUser,
        accountProfile: state.accountProfile,
      }),
    },
  ),
);

export default useMenuStore;