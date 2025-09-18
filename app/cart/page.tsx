"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/ui/loading-spinner"
import EmptyState from "@/components/ui/empty-state"
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import api from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export default function CartPage() {
  const { cart, removeFromCart, clearCart, loading, refreshCart } = useCart()
  const { user } = useAuth()
  const [placing, setPlacing] = useState(false)
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const router = useRouter()

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId)
      return
    }

    setUpdatingItems((prev) => new Set(prev).add(productId))

    try {
      const currentQuantity = cart?.items.find((item) => item.product._id === productId)?.quantity || 0
      const quantityDiff = newQuantity - currentQuantity

      await api.post("/api/cart/add", {
        userId: user?._id,
        productId,
        quantity: quantityDiff,
      })

      await refreshCart()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => {
      const price = item.product.discount > 0
        ? item.product.price - (item.product.price * item.product.discount) / 100
        : item.product.price
      return total + price * item.quantity
    }, 0)
  }

  const placeOrder = async () => {
    if (!user) return;

    setPlacing(true);
    try {
      // First, get the latest cart data with populated product information
      const cartResponse = await api.get(`/api/cart/${user._id}`);
      const currentCart = cartResponse.data;
      
      if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
        toast({
          title: "Error",
          description: "Your cart is empty",
          variant: "destructive",
        });
        return;
      }

      // Prepare order data with creator information
      const orderData = {
        userId: user._id,
        items: currentCart.items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          // Include creator information from the product
          creator: {
            userId: item.product.user?.userId?._id || item.product.user?._id,
            userName: item.product.user?.userName || item.product.user?.name || "Unknown",
            email: item.product.user?.email || "unknown@example.com",
            phone: item.product.user?.phone || "",
            address: item.product.user?.address || {}
          }
        }))
      };

      const response = await api.post("/api/orders/place", orderData);
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
      
      await clearCart();
      router.push("/orders");
    } catch (error: any) {
      let message = error.response?.data?.message || "Failed to place order";
      
      // Handle stock errors specifically
      if (error.response?.status === 400 && error.response.data.message.includes("Not enough stock")) {
        message = error.response.data.message;
        // Refresh cart to get updated stock information
        await refreshCart();
      }
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response.data.message.includes("validation failed")) {
        message = "Order validation failed. Please try again or contact support.";
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setPlacing(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-gray-600 mb-4">You need to login to view your cart</p>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="Your cart is empty"
          description="Add some products to your cart to get started"
          action={{
            label: "Continue Shopping",
            onClick: () => router.push("/products"),
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/products" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600">Review your items and proceed to checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cart Items ({cart.items.length})</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCart}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => {
                const discountedPrice = item.product.discount > 0
                  ? item.product.price - (item.product.price * item.product.discount) / 100
                  : item.product.price

                const isUpdating = updatingItems.has(item.product._id)

                return (
                  <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Image
                      src={item.product.image || "/placeholder.svg?height=80&width=80&query=product"}
                      alt={item.product.name || "Product image"}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{item.product.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-bold text-green-600">Frw{discountedPrice?.toFixed(2)}</span>
                        {item.product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">Frw{item.product.price.toFixed(2)}</span>
                        )}
                        <span className="text-sm text-gray-500">/{item.product.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        disabled={isUpdating || loading}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">
                        {isUpdating ? <LoadingSpinner size="sm" /> : item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={isUpdating || loading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">frw{(discountedPrice * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Frw{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Frw{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="secondary" className="w-full justify-center">
                  Payment Method: Cash on Delivery
                </Badge>
                <Button 
                  className="w-full" 
                  onClick={placeOrder} 
                  disabled={placing || loading}
                >
                  {placing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}