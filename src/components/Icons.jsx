export function ArrowUpRight({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 12.5 12.5 3.5M5 3.5h7.5V11" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function CloseIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m3.5 3.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function PlusIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
