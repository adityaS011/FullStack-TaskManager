"use client";

import { ButtonHTMLAttributes, KeyboardEvent, useId, useRef, useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";
import { SelectMenu } from "@/components/ui/select-menu";
import { getNextIndex, optionId, SelectOption } from "@/components/ui/select-types";
import { useOutsidePointer } from "@/components/ui/use-outside-pointer";

export type { SelectOption } from "@/components/ui/select-types";

type SelectProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onChange" | "value"> & {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
};

export function Select({
  className,
  disabled,
  options,
  value,
  onKeyDown,
  onValueChange,
  ...props
}: SelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(options.findIndex((option) => option.value === value), 0);
  const selected = options[selectedIndex] ?? { label: "Select", value: "" };
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  useOutsidePointer(open, rootRef, () => setOpen(false));

  function choose(option: SelectOption) {
    if (option.disabled) return;
    onValueChange(option.value);
    setOpen(false);
  }

  function openMenu() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function toggleMenu() {
    if (open) setOpen(false);
    else openMenu();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        setActiveIndex(getNextIndex(options, selectedIndex, step));
        setOpen(true);
      } else {
        setActiveIndex((index) => getNextIndex(options, index, step));
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(options[activeIndex] ?? selected);
      else openMenu();
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-activedescendant={open ? optionId(listboxId, options[activeIndex]) : undefined}
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        role="combobox"
        type="button"
        className={cn(
          "relative h-10 w-full rounded-md border border-border bg-surface pl-3 pr-10 text-left text-sm font-medium outline-none transition",
          "hover:bg-muted/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className="block truncate">{selected.label}</span>
        <AppIcon
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition",
            open && "rotate-180 text-foreground",
          )}
          name="chevron-down"
          size={17}
        />
      </button>

      {open && (
        <SelectMenu
          activeIndex={activeIndex}
          listboxId={listboxId}
          options={options}
          value={value}
          onActiveChange={setActiveIndex}
          onChoose={choose}
        />
      )}
    </div>
  );
}
