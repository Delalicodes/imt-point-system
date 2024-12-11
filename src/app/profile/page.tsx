"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useUser } from '@/contexts/UserContext'

export default function ProfilePage() {
  const [message, setMessage] = useState({ type: "", content: "" })
  const [isUploading, setIsUploading] = useState(false)
  const { userData, updateUserData, refreshUserData } = useUser()
  
  // Form states
  const [profileData, setProfileData] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    imageUrl: "/images/it-education-logo.svg"
  })

  useEffect(() => {
    if (userData) {
      setProfileData(prev => ({
        ...prev,
        username: userData.username,
        imageUrl: userData.imageUrl
      }))
    }
  }, [userData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage({ type: "", content: "" })
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Only update the image URL
        const profileResponse = await fetch("/api/admin/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: data.url
          }),
        })
        
        if (profileResponse.ok) {
          updateUserData({
            ...userData!,
            imageUrl: data.url
          })
          setProfileData(prev => ({
            ...prev,
            imageUrl: data.url
          }))
          setMessage({ type: "success", content: "Profile picture updated successfully" })
        } else {
          const errorData = await profileResponse.json()
          setMessage({ type: "error", content: errorData.error || "Failed to update profile picture" })
        }
      } else {
        setMessage({ type: "error", content: data.error || "Failed to upload image" })
      }
    } catch (error) {
      setMessage({ type: "error", content: "Failed to upload image" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", content: "" })

    // Create update data object with only the fields that have changed
    const updateData: any = {}

    if (profileData.username && profileData.username !== userData?.username) {
      updateData.username = profileData.username
    }

    // Only include password fields if user is changing password
    if (profileData.newPassword) {
      // Validate passwords match if changing password
      if (profileData.newPassword !== profileData.confirmPassword) {
        setMessage({ type: "error", content: "New passwords do not match" })
        return
      }
      if (!profileData.currentPassword) {
        setMessage({ type: "error", content: "Current password is required to change password" })
        return
      }
      updateData.currentPassword = profileData.currentPassword
      updateData.newPassword = profileData.newPassword
    }

    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (response.ok) {
        await refreshUserData()
        setMessage({ type: "success", content: "Profile updated successfully" })
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }))
      } else {
        setMessage({ type: "error", content: data.error })
      }
    } catch (error) {
      setMessage({ type: "error", content: "Failed to update profile" })
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Welcome, {userData?.username}</h2>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          {/* Profile Picture */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24 group">
                <Image
                  src={profileData.imageUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Change photo</p>
                <p className="text-xs text-gray-500">Click the image to upload a new photo</p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={profileData.username}
              onChange={handleInputChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border"
              placeholder="Enter your username"
            />
          </div>

          {/* Password Section */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            
            {/* Current Password */}
            <div className="mb-6">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={profileData.currentPassword}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border"
                placeholder="Enter your current password"
              />
            </div>

            {/* New Password */}
            <div className="mb-6">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={profileData.newPassword}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border"
                placeholder="Enter your new password"
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2.5 border"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          {/* Status Message */}
          {message.content && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}>
              {message.content}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
