import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function TeacherRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (user?.role === "TEACHER") redirect("/teacher")
  if (user?.role === "ADMIN") redirect("/admin")
  return children
}
