"use client"

import PointsPanel from "@/components/points/PointsPanel"
import DashboardLayout from '@/components/layout/dashboard-layout'

export default function PointsPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PointsPanel />
      </div>
    </DashboardLayout>
  )
}
