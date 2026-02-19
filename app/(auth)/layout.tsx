import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: branding (hidden on small screens) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background image */}
        <Image
          src="/Images/teacher happy.jpg"
          alt="Teacher earning with Somovibe"
          fill
          className="object-cover object-center"
          priority
          sizes="55vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,26,13,0.93) 0%, rgba(0,77,37,0.85) 60%, rgba(0,140,67,0.75) 100%)" }} />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logos/Somovibe logo white.png" alt="Somovibe" width={44} height={44} className="h-10 w-auto object-contain" />
            <Image src="/logos/Somovibe text white.png" alt="Somovibe" width={160} height={44} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
              Turn your CBC expertise<br />into monthly income.
            </h2>
            <p className="text-white/70 text-base xl:text-lg leading-relaxed max-w-md">
              Upload your notes once. Earn 75% on every sale — while students across Kenya access quality materials at fair prices.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10,000+", label: "Resources sold" },
              { value: "75%", label: "Teacher cut" },
              { value: "Free", label: "To join" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-white">{s.value}</div>
                <div className="text-white/55 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} Somovibe · Kenya&apos;s CBC Marketplace
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 bg-[#f5faf7] min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-3">
          <Image src="/logos/Somovibe logo.png" alt="Somovibe" width={40} height={40} className="h-9 w-auto object-contain" />
          <Image src="/logos/Somovibe text.png" alt="Somovibe" width={160} height={44} className="h-9 w-auto object-contain" />
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
