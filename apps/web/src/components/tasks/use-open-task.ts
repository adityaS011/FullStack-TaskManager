"use client";

import { KeyboardEvent, MouseEvent } from "react";
import { useRouter } from "next/navigation";

const interactiveSelector = "a, button, input, select, textarea, [role='button'], [role='link']";

export function useOpenTask(taskId: string) {
  const router = useRouter();
  const href = `/tasks/${taskId}`;

  function openTask() {
    router.push(href);
  }

  function onClick(event: MouseEvent<HTMLElement>) {
    const nestedInteractive = (event.target as HTMLElement).closest(interactiveSelector);
    if (nestedInteractive && nestedInteractive !== event.currentTarget) return;
    openTask();
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openTask();
  }

  return { href, onClick, onKeyDown };
}
