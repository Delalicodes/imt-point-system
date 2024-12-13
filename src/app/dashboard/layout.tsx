import NewDashboardLayout from '@/components/layout/new-dashboard-layout'
import DashboardHeader from '@/components/layout/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      <NewDashboardLayout>{children}</NewDashboardLayout>
    </div>
  )
}
