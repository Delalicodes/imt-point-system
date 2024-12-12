import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Points Management",
  description: "Manage student points and rewards",
}

export default function PointsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
