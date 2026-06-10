"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { cn } from "@/lib/utils";
import { optionId, SelectOption } from "@/components/ui/select-types";

type SelectMenuProps = {
  activeIndex: number;
  listboxId: string;
  options: SelectOption[];
  value: string;
  onActiveChange: (index: number) => void;
  onChoose: (option: SelectOption) => void;
};

export function SelectMenu({
  activeIndex,
  listboxId,
  options,
  value,
  onActiveChange,
  onChoose,
}: SelectMenuProps) {
  return (
    <div
      className="absolute left-0 top-[calc(100%+0.375rem)] z-40 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-2xl"
      id={listboxId}
      role="listbox"
    >
      {options.map((option, index) => {
        const active = index === activeIndex;
        const selected = option.value === value;

        return (
          <button
            aria-selected={selected}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm font-medium transition",
              active && "bg-muted text-foreground",
              selected ? "text-blue-700 dark:text-blue-300" : "text-foreground",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={option.disabled}
            id={optionId(listboxId, option)}
            key={option.value}
            role="option"
            tabIndex={-1}
            type="button"
            onClick={() => onChoose(option)}
            onMouseEnter={() => onActiveChange(index)}
          >
            <span className="grid h-4 w-4 place-items-center">
              {selected && <AppIcon name="check-line" size={15} />}
            </span>
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
