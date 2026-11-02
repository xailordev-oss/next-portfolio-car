"use client";

import { useEffect } from "react";

// Shared scroll state. It is mutated in place and read inside useFrame,
// so scrolling never triggers a React re-render.
export type ScrollExplodeState = {
  /** How far apart the parts should be, 0 (assembled) to 1 (maximum). */
  target: number;
  scrolling: boolean;
  /** performance.now() when scrolling stopped; the reassembly starts here. */
  settledAt: number;
  reducedMotion: boolean;
};

const STOP_DELAY_MS = 150; // No scroll event for this long means "stopped".
const MAX_SPEED_PX_PER_MS = 4; // At this speed the explosion reaches its limit.
const MIN_EXPLODE = 0.22; // Even a slow scroll visibly separates the parts.

const state: ScrollExplodeState = {
  target: 0,
  scrolling: false,
  settledAt: 0,
  reducedMotion: false,
};

let subscribers = 0;
let detach: (() => void) | null = null;

function attach() {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let lastY = window.scrollY;
  let lastTime = performance.now();
  let stopTimer = 0;

  const stop = () => {
    state.scrolling = false;
    state.target = 0;
    state.settledAt = performance.now();
  };

  const onScroll = () => {
    const now = performance.now();
    const distance = Math.abs(window.scrollY - lastY);
    const elapsed = Math.max(now - lastTime, 8);
    lastY = window.scrollY;
    lastTime = now;
    if (state.reducedMotion || distance === 0) return;

    // Faster scrolling separates further, capped at 1. Keeping part of the
    // previous value smooths out the uneven timing of scroll events.
    const speed = Math.min(distance / elapsed / MAX_SPEED_PX_PER_MS, 1);
    const instant = MIN_EXPLODE + (1 - MIN_EXPLODE) * speed;
    state.target = Math.max(instant, state.target * 0.9);
    state.scrolling = true;

    window.clearTimeout(stopTimer);
    stopTimer = window.setTimeout(stop, STOP_DELAY_MS);
  };

  const onMotionChange = () => {
    state.reducedMotion = media.matches;
    if (media.matches) stop();
  };

  onMotionChange();
  window.addEventListener("scroll", onScroll, { passive: true });
  media.addEventListener("change", onMotionChange);

  return () => {
    window.clearTimeout(stopTimer);
    window.removeEventListener("scroll", onScroll);
    media.removeEventListener("change", onMotionChange);
  };
}

export function useScrollExplode(): ScrollExplodeState {
  useEffect(() => {
    // Every car shares one scroll listener.
    subscribers += 1;
    if (subscribers === 1) detach = attach();
    return () => {
      subscribers -= 1;
      if (subscribers === 0) {
        detach?.();
        detach = null;
      }
    };
  }, []);

  return state;
}
