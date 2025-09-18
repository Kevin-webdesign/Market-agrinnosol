"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import type { Cart, CartContextType } from "@/types"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user])

  const fetchCart = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await api.get(`/api/cart/${user._id}`)
      setCart(response.data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCart = async () => {
    await fetchCart()
  }

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await api.post("/api/cart/add", {
        userId: user._id,
        productId,
        quantity,
      })
      setCart(response.data)
      toast({
        title: "Success",
        description: "Item added to cart!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add item to cart"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return

    try {
      const response = await api.post("/api/cart/remove", {
        userId: user._id,
        productId,
      })
      setCart(response.data)
      toast({
        title: "Success",
        description: "Item removed from cart!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove item from cart"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    if (!user) return

    try {
      const response = await api.delete(`/api/cart/clear/${user._id}`)
      setCart(response.data)
      toast({
        title: "Success",
        description: "Cart cleared!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to clear cart"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const getCartItemsCount = () => {
    if (!cart || !cart.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        getCartItemsCount,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}