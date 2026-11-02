import type { CSSProperties } from "react";
export function Icon({ name, size = 22, style }: { name: string; size?: number; style?: CSSProperties }) {
  const paths: Record<string, React.ReactNode> = {
    search: <>
      <circle cx="10.5" cy="10.5" r="7.5" />
      <path d="m16 16 5 5" />
    </>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    cart: <>
      <path d="M2 3h3l3 13h11l3-10H5.7" />
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
    </>,
    bag: <>
      <path d="M4 7h16l1 14H3L4 7Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </>,
    user: <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
    </>,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />, close: <path d="m5 5 14 14M19 5 5 19" />,
    arrow: <path d="m9 5 7 7-7 7" />, play: <path d="m9 5 11 7-11 7V5Z" />,
    home: <>
      <path d="m2 10 10-8 10 8v12H2V10Z" />
      <path d="M9 22v-8h6v8" />
    </>, grid: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
    instagram: <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name] || paths.arrow}</svg>;
}
