"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

const slides = [
    {
        image: "/images/slider1.jpg",
        alt: "Students learning with quality materials"
    },
    {
        image: "/images/slider2.jpg",
        alt: "Teachers sharing knowledge"
    },
    {
        image: "/images/slider3.jpg",
        alt: "CBC curriculum resources"
    },
    {
        image: "/images/slider4.jpg",
        alt: "Interactive learning experience"
    }
]

export default function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(
                prev => (prev + 1) % slides.length
            )
        }, 3000)

        return () => clearInterval(timer)
    }, [])

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    return (
        <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentSlide
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                >
                    <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                    />
                    {/* Gradient Overlay - darker for better text readability */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-black/60" />
                </div>
            ))}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 drop-shadow-2xl">
                        Welcome to{" "}
                        <span className="text-primary drop-shadow-2xl">
                            Somovibe
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 md:mb-10 max-w-3xl mx-auto drop-shadow-lg">
                        Quality CBC learning materials from
                        verified teachers. Learn, teach, and
                        earn.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/marketplace"
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 text-center shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                            Browse Materials
                        </Link>
                        <Link
                            href="/teacher-register"
                            className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-white/90 text-center shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                            Become a Teacher
                        </Link>
                    </div>
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${
                            index === currentSlide
                                ? "bg-white w-8 shadow-lg"
                                : "bg-white/50 hover:bg-white/75 w-3"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
