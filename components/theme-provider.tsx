'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Only render theme provider after first client render
  // This prevents hydration mismatch errors
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return children only during SSR to avoid hydration issues
    return <>{children}</>
  }

  return (
    <NextThemesProvider 
      enableSystem={false} 
      disableTransitionOnChange 
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
