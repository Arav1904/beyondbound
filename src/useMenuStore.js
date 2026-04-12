import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const CART_KEY_SEPARATOR = "::";

const createDefaultProfile = () => ({
  name: "",
  email: "",
  phone: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
});

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const toNonNegativeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const normalizeCartItem = (item) => {
  if (!item) {
    return null;
  }

  const productId = String(item.productId || item.id || "").trim();
  const productName = String(item.productName || item.name || "").trim();

  if (!productId || !productName) {
    return null;
  }

  const size = String(item.size || "").trim();
  const serverId = item._id ? String(item._id) : "";
  const localId =
    String(item.id || "").trim() ||
    `${productId}${CART_KEY_SEPARATOR}${size || "default"}`;

  return {
    _id: serverId || undefined,
    id: serverId || localId,
    productId,
    productName,
    image: String(item.image || item.imageUrl || "").trim(),
    price: toNonNegativeNumber(item.price, 0),
    size,
    quantity: toPositiveInt(item.quantity, 1),
  };
};

const cartItemKey = (item) =>
  `${item.productId}${CART_KEY_SEPARATOR}${item.size || "default"}`;

const calculateCartTotals = (items) => ({
  cartTotalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  cartSubtotal: Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  ),
});

const mergeCartItems = (existingItems = [], incomingItems = []) => {
  const map = new Map();

  for (const item of existingItems) {
    const normalized = normalizeCartItem(item);
    if (!normalized) {
      continue;
    }

    map.set(cartItemKey(normalized), normalized);
  }

  for (const item of incomingItems) {
    const normalized = normalizeCartItem(item);
    if (!normalized) {
      continue;
    }

    const key = cartItemKey(normalized);
    const existing = map.get(key);

    if (existing) {
      map.set(key, {
        ...existing,
        _id: existing._id || normalized._id,
        id: existing._id || existing.id || normalized.id,
        quantity: toPositiveInt(existing.quantity + normalized.quantity),
      });
      continue;
    }

    map.set(key, normalized);
  }

  return Array.from(map.values());
};

const toCartState = (cart) => {
  const items = Array.isArray(cart?.items)
    ? cart.items.map(normalizeCartItem).filter(Boolean)
    : [];

  const totals = calculateCartTotals(items);

  return {
    cartItems: items,
    cartTotalItems:
      typeof cart?.totalItems === "number"
        ? cart.totalItems
        : totals.cartTotalItems,
    cartSubtotal:
      typeof cart?.subtotal === "number" ? cart.subtotal : totals.cartSubtotal,
  };
};

const useMenuStore = create(
  persist(
    (set) => ({
      activeMenu: null,
      activePage: "home",
      isLoginModalOpen: false,
      authMode: "login",
      authToken: null,
      signedInUser: null,
      isAccountModalOpen: false,
      accountModalSection: "profile",
      accountProfile: createDefaultProfile(),
      cartItems: [],
      cartTotalItems: 0,
      cartSubtotal: 0,
      isCartOpen: false,
      isPreOrderModalOpen: false,
      preOrderDraft: null,
      isCartSyncing: false,
      cartMessage: "",

      setActiveMenu: (menuName) => set({ activeMenu: menuName }),
      setActivePage: (pageName) =>
        set({ activePage: pageName, activeMenu: null }),
      setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
      setAuthMode: (mode) => set({ authMode: mode }),
      setAuthToken: (token) => set({ authToken: token || null }),
      setSignedInUser: (user) =>
        set((state) => {
          if (!user) {
            return {
              signedInUser: null,
              authToken: null,
              accountProfile: createDefaultProfile(),
              cartItems: [],
              cartTotalItems: 0,
              cartSubtotal: 0,
            };
          }

          return {
            signedInUser: user,
            accountProfile: {
              ...state.accountProfile,
              name: state.accountProfile.name || user.name || "",
              email: user.email || state.accountProfile.email || "",
            },
          };
        }),
      setAuthSession: ({ token, user, cart }) =>
        set((state) => {
          const nextProfile = {
            ...state.accountProfile,
            name: user?.name || state.accountProfile.name || "",
            email: user?.email || state.accountProfile.email || "",
            phone: user?.phone || state.accountProfile.phone || "",
            address: {
              ...state.accountProfile.address,
              ...(user?.address || {}),
            },
          };

          return {
            authToken: token || state.authToken,
            signedInUser: user || state.signedInUser,
            accountProfile: nextProfile,
            ...(cart ? toCartState(cart) : {}),
          };
        }),
      openAccountModal: (section = "profile") =>
        set({
          isAccountModalOpen: true,
          accountModalSection: section,
          isLoginModalOpen: false,
        }),
      setIsAccountModalOpen: (isOpen) => set({ isAccountModalOpen: isOpen }),
      setAccountModalSection: (section) =>
        set({ accountModalSection: section }),
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
                  phone: nextProfile.phone || state.signedInUser.phone,
                  address: nextProfile.address,
                }
              : state.signedInUser,
          };
        }),
      logout: () =>
        set({
          signedInUser: null,
          isLoginModalOpen: false,
          isAccountModalOpen: false,
          accountModalSection: "profile",
          authToken: null,
          authMode: "login",
          isCartOpen: false,
          isCartSyncing: false,
          cartMessage: "",
          accountProfile: createDefaultProfile(),
          cartItems: [],
          cartTotalItems: 0,
          cartSubtotal: 0,
        }),
      setCartFromServer: (cart) => set({ ...toCartState(cart) }),
      addToCartLocal: (item) =>
        set((state) => {
          const normalized = normalizeCartItem(item);
          if (!normalized) {
            return {};
          }

          const cartItems = mergeCartItems(state.cartItems, [normalized]);
          return {
            cartItems,
            ...calculateCartTotals(cartItems),
          };
        }),
      updateLocalCartItemQuantity: (lineId, quantity) =>
        set((state) => {
          const nextQuantity = toPositiveInt(quantity, 0);

          const cartItems =
            nextQuantity < 1
              ? state.cartItems.filter(
                  (item) => item.id !== lineId && item._id !== lineId,
                )
              : state.cartItems.map((item) => {
                  const matches = item.id === lineId || item._id === lineId;
                  if (!matches) {
                    return item;
                  }

                  return {
                    ...item,
                    quantity: nextQuantity,
                  };
                });

          return {
            cartItems,
            ...calculateCartTotals(cartItems),
          };
        }),
      removeLocalCartItem: (lineId) =>
        set((state) => {
          const cartItems = state.cartItems.filter(
            (item) => item.id !== lineId && item._id !== lineId,
          );

          return {
            cartItems,
            ...calculateCartTotals(cartItems),
          };
        }),
      clearCartLocal: () =>
        set({
          cartItems: [],
          cartTotalItems: 0,
          cartSubtotal: 0,
        }),
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      openPreOrderModal: (draft = null) =>
        set({
          isPreOrderModalOpen: true,
          preOrderDraft: draft && typeof draft === "object" ? draft : null,
        }),
      closePreOrderModal: () =>
        set({
          isPreOrderModalOpen: false,
          preOrderDraft: null,
        }),
      setPreOrderDraft: (draft = null) =>
        set({
          preOrderDraft: draft && typeof draft === "object" ? draft : null,
        }),
      setCartSyncing: (isSyncing) => set({ isCartSyncing: isSyncing }),
      setCartMessage: (message) => set({ cartMessage: message }),
      clearCartMessage: () => set({ cartMessage: "" }),
      clearMenu: () => set({ activeMenu: null }),
    }),
    {
      name: "beyond-bound-ui-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authToken: state.authToken,
        signedInUser: state.signedInUser,
        accountProfile: state.accountProfile,
        cartItems: state.cartItems,
        cartTotalItems: state.cartTotalItems,
        cartSubtotal: state.cartSubtotal,
      }),
    },
  ),
);

export default useMenuStore;
