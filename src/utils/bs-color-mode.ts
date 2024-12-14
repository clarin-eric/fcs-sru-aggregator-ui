/*!
 * Color mode switcher based on example from Bootstrap 5 docs.
 * @see https://getbootstrap.com/docs/5.3/customize/color-modes/#javascript
 */

import { useEffect } from 'react'

function getPreferredTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function setTheme(theme: string) {
  if (theme === 'auto') {
    document.documentElement.setAttribute(
      'data-bs-theme',
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    )
  } else {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }
}

export function useColorMode() {
  useEffect(() => {
    function updateTheme() {
      setTheme(getPreferredTheme())
    }

    // run initial update
    updateTheme()

    // start event listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme)
    // stop event listener on dispose
    return () =>
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateTheme)
  }, [])
}
