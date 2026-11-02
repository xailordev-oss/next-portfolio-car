"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PaintColor } from "@/data/cars";

type ColorPickerProps = {
  groupName: string;
  carName: string;
  colors: PaintColor[];
  selected: PaintColor;
  preview: PaintColor | null;
  onPreview: (color: PaintColor | null) => void;
  onSelect: (color: PaintColor) => void;
};

// Native radio buttons give keyboard users arrow-key control for free.
export default function ColorPicker({ groupName, carName, colors, selected, preview, onPreview, onSelect }: ColorPickerProps) {
  const shown = preview ?? selected;

  return (
    <fieldset className="pointer-events-auto flex flex-col items-center">
      <legend className="sr-only">ເລືອກສີຂອງ {carName}</legend>
      <div className="flex" onPointerLeave={() => onPreview(null)}>
        {colors.map((color) => {
          const isSelected = color.hex === selected.hex;
          return (
            <label
              key={color.hex}
              className="group relative flex size-11 cursor-pointer items-center justify-center"
              // Mouse only: on touch a tap goes straight to selecting the colour.
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") onPreview(color);
              }}
            >
              <input
                type="radio"
                name={groupName}
                value={color.hex}
                checked={isSelected}
                onChange={() => {
                  onSelect(color);
                  onPreview(null);
                }}
                aria-label={color.name}
                className="peer sr-only"
              />
              <span
                style={{ backgroundColor: color.hex }}
                className="size-7 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.28)] transition-transform duration-200 ease-out group-hover:scale-110 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[5px] peer-focus-visible:outline-foreground"
              />
              {/* The selected colour carries a ring, not just a change of hue. */}
              <span
                className={`pointer-events-none absolute size-9 rounded-full border transition-opacity duration-200 ${
                  isSelected ? "border-foreground opacity-100" : "border-transparent opacity-0"
                }`}
              />
            </label>
          );
        })}
      </div>
      <div className="relative mt-0.5 h-5 w-full overflow-hidden text-center text-sm text-foreground" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={shown.hex}
            className="absolute inset-x-0"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {shown.name}
          </motion.span>
        </AnimatePresence>
      </div>
    </fieldset>
  );
}
