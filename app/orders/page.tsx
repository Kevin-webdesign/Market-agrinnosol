"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LoadingSpinner from "@/components/ui/loading-spinner"
import EmptyState from "@/components/ui/empty-state"
import { ShoppingCart, ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"
import api from "@/lib/api"
import type { Order } from "@/types"

const statusIcons = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  shipped: <Truck className="h-4 w-4" />,
  delivered: <Package className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

const statusColors = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await api.get(`/api/orders/user/${user._id}`)
      setOrders(response.data || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-gray-600 mb-4">You need to login to view your orders</p>
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

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="No orders yet"
          description="You haven't placed any orders yet"
          action={{
            label: "Start Shopping",
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
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Order #{order.orderNumber || order._id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${statusColors[order.status]} text-white`}>
                    {statusIcons[order.status]}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Image
                        src={item.productDetails?.image || item.product?.image || "/placeholder.svg?height=60&width=60&query=product"}
                        alt={item.productDetails?.name || item.product?.name || "Product"}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productDetails?.name || item.product?.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}<span className="text-sm text-gray-500">{item.product.unit}</span></p> 
                        <p className="text-sm font-medium text-green-600">
                          FRW{(item.productDetails?.price || item.product?.price || 0).toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Frw{((item.productDetails?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod || "COD"}</p>
                      {order.deliveryAddress && (
                        <p className="text-sm text-gray-600">
                          Delivery: {order.deliveryAddress.district}, {order.deliveryAddress.sector}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">Total: FRW{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}