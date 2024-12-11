"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search,
  Bell,
  Settings,
  ChevronDown,
  MoreVertical,
  DollarSign
} from "lucide-react"
import { Line, Pie } from "recharts"

// Mock data for charts
const chartData = [
  { name: "JAN-MAR", value: 35 },
  { name: "APR-JUN", value: 42 },
  { name: "JUL-SEP", value: 38 },
  { name: "OCT-DEC", value: 43.35 }
]

const protocolData = [
  { name: "ETHEREUM", value: 45, color: "#1E3A5F" },
  { name: "BSC", value: 30, color: "#C3F53C" },
  { name: "TRON", value: 20, color: "#B8A8E8" }
]

const rankingsData = [
  { 
    name: "MakerDAO",
    category: "CDP",
    chains: ["ETH", "BSC", "TRON"],
    change: "+3.12%",
    tvl: "$6.67B",
    icon: "🟣"
  },
  {
    name: "Convex",
    category: "CDP",
    chains: ["ETH", "BSC"],
    change: "-0.07%",
    tvl: "$2.27B",
    icon: "🔵"
  },
  {
    name: "Instadapp",
    category: "CDP",
    chains: ["ETH", "LINK"],
    change: "+0.62%",
    tvl: "$1.67B",
    icon: "⚫"
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [userData, setUserData] = useState<{ username: string; imageUrl: string } | null>(null)

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/admin/profile")
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }

    fetchUserData()
  }, [])

  return (
    <DashboardLayout>
      {/* Header */}
   

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back, {userData?.username}</h2>
          <p className="text-gray-600">Take a look at the updated DeFi overview</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* TVL Chart */}
          <div className="col-span-8 bg-[#1E3A5F] rounded-lg p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm opacity-80">TVL 2022</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold">$43.35B</span>
                  <span className="text-green-400">+13%</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 rounded bg-opacity-20 bg-white text-sm">2021</button>
                <button className="px-3 py-1 rounded bg-white bg-opacity-40 text-sm">2022</button>
              </div>
            </div>
            {/* Chart would go here - using placeholder */}
            <div className="h-48 w-full bg-opacity-10 bg-white rounded" />
          </div>

          {/* Stats Cards */}
          <div className="col-span-4 space-y-4">
            <div className="bg-[#C3F53C] rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm mb-2">Change (24h)</h3>
                  <div className="text-2xl font-bold">-4.31%</div>
                  <div className="text-sm">-0.07% this month</div>
                </div>
                <button><MoreVertical size={20} /></button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm mb-2">Maker Dominance</h3>
                  <div className="text-2xl font-bold">15.62%</div>
                  <div className="text-sm text-green-500">+1.31% this month</div>
                </div>
                <button><MoreVertical size={20} /></button>
              </div>
            </div>
          </div>

          {/* Protocols Section */}
          <div className="col-span-6 bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Top Protocols</h3>
              <button><MoreVertical size={20} /></button>
            </div>
            <div className="relative h-48">
              {/* Pie chart would go here - using placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2">
                  {protocolData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="col-span-6 bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">TVL Rankings</h3>
              <button className="flex items-center space-x-1 text-sm">
                <span>Ethereum</span>
                <ChevronDown size={16} />
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="text-left pb-4">Name</th>
                  <th className="text-left pb-4">Category</th>
                  <th className="text-left pb-4">Chains</th>
                  <th className="text-right pb-4">7D Change</th>
                  <th className="text-right pb-4">TVL</th>
                </tr>
              </thead>
              <tbody>
                {rankingsData.map((item, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <div className="flex space-x-1">
                        {item.chains.map((chain, idx) => (
                          <span key={idx} className="px-1 bg-gray-100 rounded text-xs">
                            {chain}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right" style={{ color: item.change.startsWith("+") ? "#22c55e" : "#ef4444" }}>
                      {item.change}
                    </td>
                    <td className="text-right font-medium">{item.tvl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
