const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SwapIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 7h13" />
      <path d="M14 4l3 3-3 3" />
      <path d="M20 17H7" />
      <path d="M10 20l-3-3 3-3" />
    </svg>
  );
}

export function TargetIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function ArmbandIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.3l-5.25 2.85 1-5.85L3.5 9.15l5.9-.85L12 3Z" />
    </svg>
  );
}

export function PulseIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 12h4l1.8-4.5L12.5 17 15 12h6" />
    </svg>
  );
}

export function ShieldCheckIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6l7-3Z" />
      <path d="M8.7 12.2l2.2 2.2 4.4-4.6" />
    </svg>
  );
}
