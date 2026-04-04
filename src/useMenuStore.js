import { create } from 'zustand';

const useMenuStore = create((set) => ({
  // Initial State
  activeMenu: null,
  activePage: 'home',
  isLoginModalOpen: false,
  authMode: 'login', // 'login' or 'signup'
  signedInUser: null,

  // Actions to update state
  setActiveMenu: (menuName) => set({ activeMenu: menuName }),
  setActivePage: (pageName) => set({ activePage: pageName, activeMenu: null }),
  setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
  setAuthMode: (mode) => set({ authMode: mode }),
  setSignedInUser: (user) => set({ signedInUser: user }),
  
  // Optional: A reset function
  clearMenu: () => set({ activeMenu: null }),
}));

export default useMenuStore;