"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getSizedImageUrl } from "@/lib/utils";

interface GalleryLightboxProps {
  images: string[];
  profileName: string;
}

export function GalleryLightbox({ images, profileName }: GalleryLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const blurDataURL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e5e7eb'/%3E%3C/svg%3E";

  if (!images || images.length === 0) return null;

  function openAt(index: number) {
    setCurrentIndex(index);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function showPrev(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function showNext(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }

  return (
    <>
      {/* Grid preview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={getSizedImageUrl(url, "m")}
              alt={`${profileName} - imagen ${i + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="300px"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {/* Lightbox overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            aria-label="Cerrar galería"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="relative h-[70vh] w-full max-w-3xl">
            <Image
              src={getSizedImageUrl(images[currentIndex], "l")}
              alt={`${profileName} - imagen ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 800px, 100vw"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
          </div>
        </div>
      )}
    </>
  );
}
