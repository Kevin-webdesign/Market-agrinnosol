export interface User {
  _id: string
  userName: string
  email: string
  role: string
  status: string
  phone?: string
  address?: {
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  createdAt: string
  updatedAt: string
}

export interface UserAddress {
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface ProductCreator {
  userId: string;
  userName?: string;
  email: string;
  phone?: string;
  address?: UserAddress;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  stock: number;
  discount?: number;
  rating?: number;
  featured?: boolean;
  status?: string;
  user: ProductCreator;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string
  name: string
  description?: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ requiresOtp?: boolean }>
  register: (data: RegisterData) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export interface RegisterData {
  userName: string
  email: string
  password: string
  address: string
}

export interface CartItem {
  _id: string
  product: Product
  quantity: number
}

export interface Cart {
  _id: string
  user: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: Product
  quantity: number
  productDetails?: {
    name: string
    price: number
    unit: string
    image: string
  }
  creator?: {
    userId: string
    userName: string
    email: string
    phone?: string
    address?: UserAddress
  }
}

export interface Order {
  _id: string
  user: string
  items: OrderItem[]
  totalAmount: number
  orderNumber?: string
  deliveryAddress: {
    district?: string
    sector?: string
    cell?: string
    village?: string
  }
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "COD" | string
  createdAt: string
  updatedAt: string
}

export interface CartContextType {
  cart: Cart | null
  loading: boolean
  addToCart: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  getCartItemsCount: () => number
  refreshCart: () => Promise<void>
}

export interface Wishlist {
  _id: string
  user: string
  items: Product[]
  createdAt: string
  updatedAt: string
}

export interface WishlistContextType {
  wishlist: Wishlist | null
  loading: boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  clearWishlist: () => Promise<void>
  isInWishlist: (productId: string) => boolean
  refreshWishlist: () => Promise<void>
}