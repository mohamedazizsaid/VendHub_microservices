import { Product } from "../api/product.service";

export interface CartItem {
  productId: number;
  name: string;
  category: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

const CART_STORAGE_KEY = "eventshop-cart";
const CART_CHANGED_EVENT = "cart-changed";

const parseStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) =>
      typeof item?.productId === "number" &&
      typeof item?.name === "string" &&
      typeof item?.unitPrice === "number" &&
      typeof item?.quantity === "number"
    );
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
};

const toCartItem = (product: Product, quantity: number): CartItem => {
  return {
    productId: product.id!,
    name: product.name,
    category: product.category,
    imageUrl: product.imageUrl || "https://via.placeholder.com/320x240",
    unitPrice: product.price,
    quantity,
    stock: product.stock ?? 999,
  };
};

export const cartStore = {
  eventName: CART_CHANGED_EVENT,

  getItems: (): CartItem[] => parseStoredCart(),

  getCount: (): number => {
    return parseStoredCart().reduce((total, item) => total + item.quantity, 0);
  },

  addProduct: (product: Product, quantity: number) => {
    if (!product.id) {
      throw new Error("Product ID is missing");
    }

    const qty = Math.max(1, quantity);
    const items = parseStoredCart();
    const existingIndex = items.findIndex((item) => item.productId === product.id);

    if (existingIndex >= 0) {
      const nextQuantity = Math.min(items[existingIndex].quantity + qty, items[existingIndex].stock || qty);
      items[existingIndex].quantity = Math.max(1, nextQuantity);
      saveCart(items);
      return;
    }

    items.push(toCartItem(product, qty));
    saveCart(items);
  },

  updateQuantity: (productId: number, quantity: number) => {
    const items = parseStoredCart();
    const target = items.find((item) => item.productId === productId);
    if (!target) {
      return;
    }

    target.quantity = Math.min(Math.max(1, quantity), target.stock || quantity);
    saveCart(items);
  },

  removeItem: (productId: number) => {
    const items = parseStoredCart().filter((item) => item.productId !== productId);
    saveCart(items);
  },

  clear: () => {
    saveCart([]);
  },
};
