import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "TEACHER") redirect("/teacher");
  redirect("/student");
}
