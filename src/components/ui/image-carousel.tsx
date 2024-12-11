"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"

const slides = [
  {
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200",
    quote: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela"
  },
  {
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200",
    quote: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King"
  },
  {
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200",
    quote: "Education is not preparation for life; education is life itself.",
    author: "John Dewey"
  }
]

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={`Educational slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            unoptimized
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            <blockquote className="space-y-2">
              <p className="text-lg md:text-xl lg:text-2xl font-medium">&ldquo;{slide.quote}&rdquo;</p>
              <footer className="text-sm md:text-base">&mdash; {slide.author}</footer>
            </blockquote>
          </div>
        </div>
      ))}
    </div>
  )
}
