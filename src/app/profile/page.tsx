"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
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

    const formData = new FormData()
    formData.append('image', file)

    setIsUploading(true)
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setProfileData(prev => ({ ...prev, imageUrl: data.url }))
      setMessage({ type: "success", content: "Image uploaded successfully!" })
    } catch (error) {
      setMessage({ type: "error", content: "Failed to upload image" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ type: "error", content: "New passwords do not match" })
      return
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: profileData.username,
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
          imageUrl: profileData.imageUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      updateUserData(data)
      setMessage({ type: "success", content: "Profile updated successfully!" })
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }))
    } catch (error) {
      setMessage({ type: "error", content: "Failed to update profile" })
    }
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-red-400">Error: Unable to load user session</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
      
      {message.content && (
        <div className={`p-4 mb-4 rounded ${
          message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {message.content}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <Image
              src={profileData.imageUrl}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full"
            />
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/80"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input
              type="file"
              id="profile-image"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{userData.username}</h2>
            <p className="text-gray-500">Update your photo and personal details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={profileData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={profileData.currentPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={profileData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={profileData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80"
              disabled={isUploading}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
