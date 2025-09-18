"use client"

import Image from "next/image"
import Link from "next/link"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/ui/loading-spinner"
import EmptyState from "@/components/ui/empty-state"
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from "lucide-react"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, loading } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1)
  }

  // Safe price calculation function
  const getDiscountedPrice = (product: any) => {
    const price = Number(product.price) || 0;
    const discount = Number(product.discount) || 0;
    
    if (discount > 0) {
      return price - (price * discount) / 100;
    }
    return price;
  }

  // Safe price formatting function
  const formatPrice = (price: number) => {
    return isNaN(price) ? "0.00" : price.toFixed(2);
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-gray-600 mb-4">You need to login to view your wishlist</p>
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!wishlist?.items || wishlist.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="Your wishlist is empty"
          description="Save products you love to your wishlist"
          action={{
            label: "Continue Shopping",
            onClick: () => (window.location.href = "/products"),
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">Products you've saved for later</p>
          </div>
          <Button variant="outline" onClick={clearWishlist}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.items.map((product) => {
          const discountedPrice = getDiscountedPrice(product);
          const originalPrice = Number(product.price) || 0;
          const discount = Number(product.discount) || 0;
          const rating = Number(product.rating) || 0;
          const stock = Number(product.stock) || 0;

          return (
            <Card key={product._id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={product.image || "/placeholder.svg?height=200&width=300&query=fresh+produce"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500">-{discount}%</Badge>
                  )}
                  {product.featured && <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>}

                  {/* Remove from wishlist button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>

                  {stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name || "Unnamed Product"}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description || "No description available"}</p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({rating})</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">${formatPrice(discountedPrice)}</span>
                      {discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">${formatPrice(originalPrice)}</span>
                      )}
                      <span className="text-sm text-gray-500">/{product.unit || "unit"}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {product.category || "Uncategorized"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Stock: {stock} {product.unit || "unit"}
                    </span>
                    <Button
                      size="sm"
                      disabled={stock <= 0}
                      className="flex items-center gap-1"
                      onClick={() => handleAddToCart(product._id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}