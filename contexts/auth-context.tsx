"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import api from "@/lib/api"
import type { User, AuthContextType, RegisterData } from "@/types"
import { toast } from "@/hooks/use-toast"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get("/api/auth/profile")
      setUser(response.data)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password })

      if (response.data.requiresOtp) {
        return { requiresOtp: true }
      }

      setUser(response.data.user)
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })
      return {}
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post("/api/auth/register", data)
      setUser(response.data.user)
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    try {
      await api.post("/api/auth/verify-otp", { email, otp })
      await checkAuth() // Refresh user data
      toast({
        title: "Success",
        description: "OTP verified successfully!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "OTP verification failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post("/api/auth/logout")
      setUser(null)
      toast({
        title: "Success",
        description: "Logged out successfully!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      })
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put("/api/auth/profile", data)
      setUser(response.data.user)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error: any) {
      const message = error.response?.data?.message || "Profile update failed"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
