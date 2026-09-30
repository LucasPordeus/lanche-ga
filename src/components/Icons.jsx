function base(props, path) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={props.size || 22}
      height={props.size || 22}
      className={props.className}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

export const IconHome = (p) =>
  base(p, <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />)

export const IconCalendar = (p) =>
  base(
    p,
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
    </>,
  )

export const IconClock = (p) =>
  base(
    p,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>,
  )

export const IconHistory = (p) =>
  base(
    p,
    <>
      <path d="M3 12a9 9 0 1 0 2.6-6.3" />
      <path d="M3 4v5h5" />
      <path d="M12 8v4l3 2" />
    </>,
  )

export const IconShield = (p) =>
  base(p, <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />)

export const IconLogOut = (p) =>
  base(
    p,
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>,
  )

export const IconCheck = (p) => base(p, <path d="M4 12.5l5 5L20 6" />)

export const IconX = (p) => base(p, <path d="M6 6l12 12M18 6 6 18" />)

export const IconPlus = (p) => base(p, <path d="M12 5v14M5 12h14" />)

export const IconAlert = (p) =>
  base(
    p,
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </>,
  )

export const IconSwap = (p) =>
  base(
    p,
    <>
      <path d="M4 7h13l-3-3M20 17H7l3 3" />
    </>,
  )

export const IconUser = (p) =>
  base(
    p,
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </>,
  )
