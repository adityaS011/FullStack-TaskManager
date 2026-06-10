"use client";

import { RefObject, useEffect } from "react";

export function useOutsidePointer<T extends HTMLElement>(
  active: boolean,
  ref: RefObject<T | null>,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!active) return;

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onOutside();
    }

    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [active, onOutside, ref]);
}
