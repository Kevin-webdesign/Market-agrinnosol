"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { User, Phone, MapPin, Calendar, Edit, Save, X } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    userName: user?.userName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: {
      district: user?.address?.district || "",
      sector: user?.address?.sector || "",
      cell: user?.address?.cell || "",
      village: user?.address?.village || "",
    },
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login</h2>
            <p className="text-gray-600 mb-4">You need to login to view your profile</p>
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

  const handleSave = async () => {
    setUpdating(true)
    try {
      await updateProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: {
        district: user?.address?.district || "",
        sector: user?.address?.sector || "",
        cell: user?.address?.cell || "",
        village: user?.address?.village || "",
      },
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-green-600 text-white text-2xl">
                  {user.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold mb-2">{user.userName}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="space-y-2">
                <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={updating}>
                    {updating ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="userName">Username</Label>
                    {isEditing ? (
                      <Input
                        id="userName"
                        value={formData.userName}
                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.userName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Information
                </h3>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.phone || "Not provided"}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">District</Label>
                    {isEditing ? (
                      <Input
                        id="district"
                        value={formData.address.district}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, district: e.target.value },
                          })
                        }
                        placeholder="Enter district"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.address?.district || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    {isEditing ? (
                      <Input
                        id="sector"
                        value={formData.address.sector}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, sector: e.target.value },
                          })
                        }
                        placeholder="Enter sector"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.address?.sector || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cell">Cell</Label>
                    {isEditing ? (
                      <Input
                        id="cell"
                        value={formData.address.cell}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, cell: e.target.value },
                          })
                        }
                        placeholder="Enter cell"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.address?.cell || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="village">Village</Label>
                    {isEditing ? (
                      <Input
                        id="village"
                        value={formData.address.village}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, village: e.target.value },
                          })
                        }
                        placeholder="Enter village"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{user.address?.village || "Not provided"}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
