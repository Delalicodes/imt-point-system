"use client"

import { X, User, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfileProps {
  user: {
    username: string
    firstName: string
    lastName: string
  }
  onClose: () => void
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  return (
    <div className="w-80 border-l border-[#2B2B3F] bg-[#1E1E2D] flex flex-col text-white">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-[#2B2B3F]">
        <h3 className="text-lg font-semibold">Profile</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-purple-600 text-xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <h4 className="text-xl font-semibold mt-4">
              {user.firstName} {user.lastName}
            </h4>
            <p className="text-sm text-gray-400">{user.username}</p>
          </div>

          <Separator className="my-6 bg-[#2B2B3F]" />

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-4">Contact Information</h5>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{user.username}@example.com</span>
                </div>
              </div>
            </div>

            <Separator className="bg-[#2B2B3F]" />

            {/* Activity */}
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-4">Activity</h5>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Joined December 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
