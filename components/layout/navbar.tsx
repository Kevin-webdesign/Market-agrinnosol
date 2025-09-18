"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, User, LogOut, Settings, Leaf, Menu, X, Search, Globe, Heart } from "lucide-react"
import api from "@/lib/api"
import type { Category } from "@/types"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  const { wishlist } = useWishlist()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories")
      setCategories(response.data || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }
  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    router.push(`/products?${params.toString()}`)
  }

  const cartItemsCount = getCartItemsCount()
  const wishlistItemsCount = wishlist?.items?.length || 0

  return (
    <>
      {/* Top Header */}
      <div className="bg-green-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Leaf className="h-4 w-4" />
            <span>Welcome to AgroMarket - Your Agricultural Marketplace</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4" />
              <span>US EN</span>
            </div>
            {user && <span>Hello, {user.userName}!</span>}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">AgroMarket</span>
                <p className="text-xs text-gray-600">Agricultural Solutions</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 rounded-r-none border-r-0">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search AgroMarket products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-none border-l-0 border-r-0 focus:ring-0 focus:border-gray-300"
                  />
                </div>
                <Button type="submit" className="rounded-l-none bg-green-600 hover:bg-green-700">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                      {wishlistItemsCount}
                    </Badge>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500">
                      {cartItemsCount}
                    </Badge>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-600 text-white">
                          {user.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center space-x-8 overflow-x-auto">
              <Link
                href="/products"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                All Products
              </Link>
              <Link
                href="/products?featured=true"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                New Arrivals
              </Link>
              <Link
                href="/products?sort=rating"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                Best Sellers
              </Link>
              <Link
                href="/products?category=Seasonal"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                Seasonal
              </Link>
              <Link
                href="/products?category=Organic"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                Organic Products
              </Link>
              <Link
                href="/products?category=Smart Farming"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                Smart Farming
              </Link>
              <Link
                href="/bulk-orders"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                Bulk Orders
              </Link>
              <Link
                href="/learn-more"
                className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-green-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
