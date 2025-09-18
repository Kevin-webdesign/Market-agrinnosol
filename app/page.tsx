"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Product, Category } from "@/types"
import api from "@/lib/api"
import ProductCard from "@/components/products/product-card"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, ShoppingCart, Users, Award, ArrowRight, Package } from "lucide-react"

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState({
    total: 0,
    outOfStock: 0,
    categoryStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, statsRes] = await Promise.all([
        api.get("/api/goods"),
        api.get("/api/categories"),
        api.get("/api/goods/stats"),
      ])

      const products = productsRes.data.goods || []
      setAllProducts(products)
      // Filter products to only show featured ones
      setFeaturedProducts(products.filter(product => product.featured))
      setCategories(categoriesRes.data || [])
      setStats(statsRes.data || { total: 0, outOfStock: 0, categoryStats: [] })
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Prevent SSR rendering to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Fresh from Farm to Your Table</h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Discover the finest agricultural products from local farmers. Quality, freshness, and sustainability in
              every purchase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products" className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-gray-600">Total Products</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                  <p className="text-gray-600">Categories</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{featuredProducts.length}</p>
                  <p className="text-gray-600">Featured Products</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked selection of our finest agricultural products, chosen for their exceptional quality and
              freshness.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center">
                <Button asChild variant="outline" size="lg">
                  <Link href="/products" className="flex items-center gap-2">
                    View All Products
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured products available</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of agricultural products organized by category
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant="secondary">{category.itemCount} items</Badge>
                    </div>
                    {category.description && <CardDescription>{category.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                        Browse {category.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No categories available</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Agrisol Market for their fresh produce needs.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/products" className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}