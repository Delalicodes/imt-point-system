"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Member {
  label: string
  value: string
}

interface CreateGroupDialogProps {
  username: string
  onGroupCreated: () => void
}

export default function CreateGroupDialog({
  username,
  onGroupCreated
}: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [availableMembers, setAvailableMembers] = useState<Member[]>([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/students')
        if (!response.ok) throw new Error('Failed to fetch members')
        const data = await response.json()
        setAvailableMembers(data.filter((member: Member) => member.value !== username))
      } catch (error) {
        console.error('Error fetching members:', error)
        toast.error("Failed to load available members")
      }
    }

    fetchMembers()
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim() || selectedMembers.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/chat/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName.trim(),
          description: description.trim(),
          members: [...selectedMembers, username],
          createdBy: username
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create group")
      }

      toast.success("Chat group created successfully")
      setGroupName("")
      setDescription("")
      setSelectedMembers([])
      setOpen(false)
      onGroupCreated()
    } catch (error) {
      console.error("Error creating group:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create chat group")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Create New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Chat Group</DialogTitle>
            <DialogDescription>
              Create a new chat group and invite members to join.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Group Name
              </label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter group description (optional)"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="members" className="text-sm font-medium">
                Members
              </label>
              <MultiSelect
                options={availableMembers}
                value={selectedMembers}
                onChange={setSelectedMembers}
                placeholder="Select members..."
              />
              <p className="text-xs text-gray-500">
                You will be automatically added to the group
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !groupName.trim() || selectedMembers.length === 0}
            >
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
