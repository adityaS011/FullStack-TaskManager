import { SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconName =
  | "check"
  | "chevron-left"
  | "chevron-right"
  | "clipboard"
  | "close"
  | "edit"
  | "loader"
  | "login"
  | "logout"
  | "moon"
  | "plus"
  | "save"
  | "search"
  | "sun"
  | "trash"
  | "user-plus";

type AppIconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, string[]> = {
  check: ["M9 12l2 2 4-5", "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"],
  "chevron-left": ["m15 18-6-6 6-6"],
  "chevron-right": ["m9 18 6-6-6-6"],
  clipboard: ["M9 5h6", "M9 3h6a2 2 0 0 1 2 2v1H7V5a2 2 0 0 1 2-2Z", "M7 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2", "M8 12h8", "M8 16h5"],
  close: ["M18 6 6 18", "M6 6l12 12"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"],
  loader: ["M12 2v4", "M12 18v4", "M4.93 4.93l2.83 2.83", "M16.24 16.24l2.83 2.83", "M2 12h4", "M18 12h4"],
  login: ["M10 17l5-5-5-5", "M15 12H3", "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"],
  logout: ["M14 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3", "M9 12h12", "m18 9 3 3-3 3"],
  moon: ["M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.5 6.5 0 0 0 9.7 9.7Z"],
  plus: ["M12 5v14", "M5 12h14"],
  save: ["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z", "M17 21v-8H7v8", "M7 3v5h8"],
  search: ["M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z", "M16 16l5 5"],
  sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", "M12 2v2", "M12 20v2", "M4.93 4.93l1.41 1.41", "M17.66 17.66l1.41 1.41", "M2 12h2", "M20 12h2", "M6.34 17.66l-1.41 1.41", "M19.07 4.93l-1.41 1.41"],
  trash: ["M3 6h18", "M8 6V4h8v2", "M6 6l1 15h10l1-15", "M10 11v6", "M14 11v6"],
  "user-plus": ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M19 8v6", "M16 11h6"],
};

export function AppIcon({ name, size = 18, className, ...props }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("inline-block shrink-0 text-current", className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths[name].map((d) => (
        <path d={d} key={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
