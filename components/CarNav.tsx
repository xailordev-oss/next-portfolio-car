"use client";

import { motion, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { cars, developer } from "@/data/cars";

// Small fixed header: who built this, which car is showing (1/5), and links to each car.
export default function CarNav() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // A section counts as active once it crosses the middle of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveIndex(cars.findIndex((car) => car.id === entry.target.id));
        }
      },
      { rootMargin: "-50% 0px" },
    );
    for (const car of cars) {
      const element = document.getElementById(car.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-1 sm:px-8 sm:py-3">
        <a href={developer.url} target="_blank" rel="noreferrer" className="py-3 text-sm text-foreground underline-offset-4 hover:underline">
          {developer.name}
        </a>
        <nav aria-label="ລົດ" className="flex items-center gap-3">
          <p className="text-sm tabular-nums text-foreground">
            <span className="sr-only">ຄັນທີ </span>
            {activeIndex + 1}/{cars.length}
          </p>
          <ul className="flex">
            {cars.map((car, index) => (
              <li key={car.id}>
                <a
                  href={`#${car.id}`}
                  aria-label={car.name}
                  aria-current={index === activeIndex ? "true" : undefined}
                  title={car.name}
                  className="group relative flex h-11 w-8 items-center justify-center sm:w-9"
                >
                  <span className="h-px w-full bg-white/30 transition-colors group-hover:bg-white/70" />
                  {index === activeIndex && (
                    <motion.span
                      layoutId="active-car"
                      className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-foreground"
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </MotionConfig>
  );
}
