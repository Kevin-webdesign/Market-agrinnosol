"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import api from "@/lib/api"
import type { Wishlist, WishlistContextType } from "@/types"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "./auth-context"

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlist(null)
    }
  }, [user])

  const fetchWishlist = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await api.get(`/api/wishlist/${user._id}`)
      setWishlist(response.data)
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshWishlist = async () => {
    await fetchWishlist()
  }

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await api.post("/api/wishlist/add", {
        userId: user._id,
        productId,
      })
      setWishlist(response.data)
      toast({
        title: "Success",
        description: "Item added to wishlist!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add item to wishlist"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!user) return

    try {
      const response = await api.post("/api/wishlist/remove", {
        userId: user._id,
        productId,
      })
      setWishlist(response.data)
      toast({
        title: "Success",
        description: "Item removed from wishlist!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to remove item from wishlist"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const clearWishlist = async () => {
    if (!user) return

    try {
      const response = await api.delete(`/api/wishlist/clear/${user._id}`)
      setWishlist(response.data)
      toast({
        title: "Success",
        description: "Wishlist cleared!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to clear wishlist"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const isInWishlist = (productId: string) => {
    if (!wishlist || !wishlist.items) return false
    return wishlist.items.some(item => item._id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}