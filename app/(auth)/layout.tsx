import { Nav } from "@/components/Nav";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <Nav user={user ? { email: user.email, role: user.role } : null} />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-space-4 py-space-3 sm:px-space-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
