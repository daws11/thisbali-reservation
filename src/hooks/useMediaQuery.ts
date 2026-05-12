import { useEffect, useState } from 'react'

/** Reactive media-query hook (SSR-safe-ish; defaults to false on first render). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True on screens narrower than the `md` breakpoint (768px). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
