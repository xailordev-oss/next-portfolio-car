"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import type { Car, PaintColor } from "@/data/cars";

// WebGL exists only in the browser, so the canvas is never server-rendered.
const CarCanvas = dynamic(() => import("@/components/CarCanvas"), { ssr: false });

export default function CarSection({ car }: { car: Car }) {
  const section = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<PaintColor>(car.colors[0]);
  const [preview, setPreview] = useState<PaintColor | null>(null);
  const [isNear, setIsNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Browsers limit WebGL contexts, so only cars near the viewport keep a canvas.
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const near = new IntersectionObserver(([entry]) => setIsNear(entry.isIntersecting), { rootMargin: "80% 0px" });
    const visible = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    near.observe(element);
    visible.observe(element);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <section
      ref={section}
      id={car.id}
      aria-labelledby={`${car.id}-name`}
      // Starting tint only; CarModel fades it from here without a re-render.
      style={{ "--tint": car.colors[0].hex } as React.CSSProperties}
      className="relative isolate h-screen snap-start overflow-hidden bg-background supports-[height:100svh]:h-svh"
    >
      {/* Backdrop: a faint wash of the paint colour behind the car. */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(58%_46%_at_50%_56%,color-mix(in_srgb,var(--tint)_24%,transparent),transparent)]" />

      {/* OrbitControls sets touch-action: none inline, which would trap phone scrolling.
          Forcing pan-y keeps vertical swipes scrolling; horizontal drags still rotate. */}
      <div className="absolute inset-0 [&_*]:touch-pan-y!">
        {isNear && <CarCanvas car={car} color={(preview ?? selected).hex} active={isVisible} backdrop={section} />}
      </div>

      {/* The text layer lets drags through to the canvas; only controls catch them. */}
      <div className="pointer-events-none relative flex h-full flex-col items-center justify-between px-4 pb-5 pt-16 sm:px-8 sm:pb-7 sm:pt-20 [@media(max-height:560px)]:pb-2 [@media(max-height:560px)]:pt-12">
        <header className="max-w-4xl text-center">
          <h2
            id={`${car.id}-name`}
            className="text-balance text-[clamp(2.25rem,5.4vw,4.75rem)] font-light leading-[1.04] tracking-[-0.03em] [@media(max-height:560px)]:text-3xl"
          >
            {car.name}
          </h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-pretty text-[0.95rem] leading-relaxed text-muted sm:text-base [@media(max-height:560px)]:hidden">
            {car.description}
          </p>
        </header>

        <div className="flex w-full max-w-3xl flex-col items-center gap-3 sm:gap-5 [@media(max-height:560px)]:gap-1">
          <ColorPicker
            groupName={`${car.id}-color`}
            carName={car.name}
            colors={car.colors}
            selected={selected}
            preview={preview}
            onPreview={setPreview}
            onSelect={setSelected}
          />

          <dl className="grid w-full grid-cols-3 border-t border-line">
            {car.specs.map((spec, index) => (
              <div
                key={spec.label}
                className={`flex flex-col-reverse gap-1 px-1 pt-3 text-center sm:pt-4 [@media(max-height:560px)]:pt-1 ${index > 0 ? "border-l border-line" : ""}`}
              >
                <dt className="text-xs text-muted sm:text-sm">{spec.label}</dt>
                <dd className="tabular-nums">
                  <span className="text-2xl font-light tracking-[-0.02em] sm:text-4xl [@media(max-height:560px)]:text-xl">{spec.value}</span>
                  <span className="ml-1 text-xs text-muted sm:text-sm">{spec.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
