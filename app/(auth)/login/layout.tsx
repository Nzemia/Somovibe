import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (user) {
    if (user.role === "ADMIN") redirect("/admin")
    if (user.role === "TEACHER") redirect("/teacher")
    redirect("/marketplace")
  }
  return children
}
