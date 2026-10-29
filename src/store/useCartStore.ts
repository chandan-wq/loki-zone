import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedHandle?: string;
  selectedSize?: string;
  category: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  wishlist: string[]; // product IDs
  appliedCoupon: AppliedCoupon | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string, color?: string, handle?: string, size?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, handle?: string, size?: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCartTotal: () => number;
  getDiscountAmount: (subtotal?: number) => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      wishlist: [],
      appliedCoupon: null,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product, qty = 1) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.id === product.id &&
              i.selectedColor === product.selectedColor &&
              i.selectedHandle === product.selectedHandle &&
              i.selectedSize === product.selectedSize
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += qty;
            return { items: updated, isCartOpen: true };
          }

          return {
            items: [...state.items, { ...product, quantity: qty }],
            isCartOpen: true,
          };
        }),

      removeItem: (id, color, handle, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.id === id &&
                (color ? i.selectedColor === color : true) &&
                (handle ? i.selectedHandle === handle : true) &&
                (size ? i.selectedSize === size : true)
              )
          ),
        })),

      updateQuantity: (id, quantity, color, handle, size) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  !(
                    i.id === id &&
                    (color ? i.selectedColor === color : true) &&
                    (handle ? i.selectedHandle === handle : true) &&
                    (size ? i.selectedSize === size : true)
                  )
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.id === id &&
              (color ? i.selectedColor === color : true) &&
              (handle ? i.selectedHandle === handle : true) &&
              (size ? i.selectedSize === size : true)
                ? { ...i, quantity }
                : i
            ),
          };
        }),

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      toggleWishlist: (productId: string) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      isInWishlist: (productId: string) => get().wishlist.includes(productId),

      getCartTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getDiscountAmount: (customSubtotal?: number) => {
        const subtotal = customSubtotal !== undefined ? customSubtotal : get().getCartTotal();
        const coupon = get().appliedCoupon;
        if (!coupon || subtotal <= 0) return 0;
        if (coupon.discountType === "percent") {
          return Math.round((subtotal * coupon.discountValue) / 100);
        }
        return Math.min(subtotal, coupon.discountValue);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "loki_cart_store_v2",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
