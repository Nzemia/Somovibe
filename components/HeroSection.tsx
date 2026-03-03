"use client"

import Image from "next/image"

function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    })
}

const steps = [
    {
        label: "Register",
        icon: (
            <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        )
    },
    {
        label: "Upload",
        icon: (
            <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
            </svg>
        )
    },
    {
        label: "Sell",
        icon: (
            <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L9.568 3z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6z"
                />
            </svg>
        )
    },
    {
        label: "Earn",
        icon: (
            <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
            </svg>
        )
    }
]

export function HeroSection() {
    return (
        <section
            className="relative w-full flex items-center justify-center overflow-hidden"
            style={{
                height: "calc(100dvh - 7.5rem)",
                minHeight: "480px"
            }}
        >
            {/* Background image */}
            <Image
                src="/images/teacher-happy.jpg"
                alt="Teacher earning extra income"
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
            />

            {/* Solid green overlay — 20% opacity */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor:
                        "rgba(0, 140, 67, 0.20)"
                }}
            />

            {/* Dark bottom scrim to keep buttons readable */}
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/20 to-black/30" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 max-w-3xl mx-auto w-full gap-5 sm:gap-6">
                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-xl">
                    Your Notes Are Worth{" "}
                    <span className="relative inline-block">
                        <span className="relative z-10">
                            KSh 50,000+
                        </span>
                        <span className="absolute -bottom-1 left-0 w-full h-2 bg-[#008c43]/80 rounded" />
                    </span>
                    <br className="hidden sm:block" /> Every
                    Month
                </h1>

                {/* Sub */}
                <p className="text-white/90 text-sm sm:text-lg md:text-xl leading-relaxed max-w-2xl drop-shadow-md">
                    Thousands of parents across Kenya are
                    actively searching for CBC notes —{" "}
                    <strong className="text-white">
                        your notes
                    </strong>
                    . Upload once, share your link, and earn
                    75% on every sale while you sleep.
                </p>

                {/* Process steps */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                    {steps.map((step, i) => (
                        <div
                            key={step.label}
                            className="flex items-center gap-1 sm:gap-2"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-lg">
                                    {step.icon}
                                </div>
                                <span className="text-white font-bold text-[10px] sm:text-xs tracking-wide">
                                    {step.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <svg
                                    className="w-4 h-4 text-white/60 mb-4 shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center pt-1">
                    <button
                        onClick={() =>
                            scrollTo("how-it-works")
                        }
                        className="flex items-center justify-center gap-2 px-7 py-3.5 bg-[#008c43] text-white font-extrabold rounded-xl hover:bg-[#006832] active:scale-95 transition-all duration-200 shadow-xl text-sm sm:text-base w-full sm:w-auto"
                    >
                        <svg
                            className="w-5 h-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                            />
                        </svg>
                        I want to Earn
                    </button>

                    <button
                        onClick={() =>
                            scrollTo("categories")
                        }
                        className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/15 backdrop-blur-sm border-2 border-white/60 text-white font-extrabold rounded-xl hover:bg-white/25 hover:border-white active:scale-95 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                    >
                        <svg
                            className="w-5 h-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                            />
                        </svg>
                        I want to Buy
                    </button>
                </div>
            </div>
        </section>
    )
}
