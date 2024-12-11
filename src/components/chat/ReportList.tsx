"use client"

import { useState, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Report {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
}

interface ReportListProps {
  groupId: string
}

export default function ReportList({ groupId }: ReportListProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/chat/reports?groupId=${groupId}`)
      if (!response.ok) throw new Error('Failed to fetch reports')
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [groupId])

  if (isLoading) {
    return <div className="p-4 text-center">Loading reports...</div>
  }

  if (reports.length === 0) {
    return <div className="p-4 text-center text-gray-500">No reports submitted yet</div>
  }

  return (
    <div className="border-t">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">Reports ({reports.length})</span>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>
      
      {isExpanded && (
        <ScrollArea className="h-[300px] p-4">
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-50 rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{report.title}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {report.content}
                </p>
                <div className="text-xs text-gray-500">
                  Submitted by {report.author}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
