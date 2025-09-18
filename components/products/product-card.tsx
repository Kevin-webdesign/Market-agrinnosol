"use client"

import Image from "next/image"
import type { Product } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, Heart, User, MapPin, Phone, Eye } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [showSellerInfo, setShowSellerInfo] = useState(false)

  const discountedPrice =
    product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price

  const handleAddToCart = () => {
    addToCart(product._id, 1)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist(product._id)
    }
  }

  const inWishlist = isInWishlist(product._id)

  // Format the owner's name - use userName if available, otherwise fallback to email
  const getOwnerName = () => {
    if (product.user?.userName) {
      return product.user.userName;
    }
    if (product.user?.email) {
      return product.user.email.split('@')[0]; // Use the part before @ in email
    }
    return "Unknown Seller";
  };

  // Format address if available
  const formatAddress = () => {
    if (!product.user?.address) return null;
    
    const { district, sector, cell, village } = product.user.address;
    const parts = [district, sector, cell, village].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  // Format phone number if available
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const ownerName = getOwnerName();
  const address = formatAddress();
  const phoneNumber = product.user?.phone ? formatPhoneNumber(product.user.phone) : null;

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative flex-shrink-0">
            <Image
              src={product.image || "/placeholder.svg?height=200&width=300&query=fresh+produce"}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {product.discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500">-{product.discount}%</Badge>
            )}
            {product.featured && (
              <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>
            )}

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-40 right-2 bg-white/80 hover:bg-white"
              onClick={handleWishlistToggle}
            >
              <Heart className={cn("h-4 w-4", inWishlist ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </Button>

            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                <Badge variant="destructive">Out of Stock</Badge>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-grow">
            {/* Product Owner - At the top for visibility */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    view Farmer info
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => setShowSellerInfo(true)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-grow">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">FRW{discountedPrice.toFixed(2)}</span>
                  {product.discount > 0 && (
                    <span className="text-sm text-gray-500 line-through">FRW{product.price.toFixed(2)}</span>
                  )}
                  <span className="text-sm text-gray-500">/{product.unit}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
            </div>

            {/* Stock and Add to Cart */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t">
              <span className="text-sm text-gray-600">
                Stock: {product.stock} {product.unit}
              </span>
              <Button
                size="sm"
                disabled={product.stock <= 0}
                className="flex items-center gap-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Information Dialog */}
      <Dialog open={showSellerInfo} onOpenChange={setShowSellerInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Seller Information
            </DialogTitle>
            <DialogDescription>
              Contact details for {product.name} seller
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{ownerName}</h3>
                {product.user?.email && (
                  <p className="text-sm text-gray-600">{product.user.email}</p>
                )}
              </div>
            </div>

            {product.user?.phone && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Phone Number
                </h4>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-mono">{formatPhoneNumber(product.user.phone)}</span>
                  <Button size="sm" asChild>
                    <a href={`tel:${product.user.phone}`} className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Call
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {product.user?.address && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Address
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  {product.user.address.district && (
                    <p><span className="font-medium">District:</span> {product.user.address.district}</p>
                  )}
                  {product.user.address.sector && (
                    <p><span className="font-medium">Sector:</span> {product.user.address.sector}</p>
                  )}
                  {product.user.address.cell && (
                    <p><span className="font-medium">Cell:</span> {product.user.address.cell}</p>
                  )}
                  {product.user.address.village && (
                    <p><span className="font-medium">Village:</span> {product.user.address.village}</p>
                  )}
                </div>
              </div>
            )}

            {!product.user?.phone && !product.user?.address && (
              <p className="text-gray-500 text-center py-4">
                No additional contact information available for this seller.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}