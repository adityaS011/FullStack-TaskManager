export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export function optionId(listboxId: string, option?: SelectOption) {
  return option ? `${listboxId}-${option.value}` : undefined;
}

export function getNextIndex(options: SelectOption[], currentIndex: number, step: number) {
  if (options.length === 0) return 0;
  let nextIndex = currentIndex;

  for (let attempts = 0; attempts < options.length; attempts += 1) {
    nextIndex = (nextIndex + step + options.length) % options.length;
    if (!options[nextIndex]?.disabled) return nextIndex;
  }

  return currentIndex;
}
