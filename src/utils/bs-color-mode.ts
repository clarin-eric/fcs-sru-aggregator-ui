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

/**
 * Sets the theme for the document, adds event listener for color-scheme changes.
 * Should run once, and will stop the event listener at the lifecycle end.
 */
export function useColorMode() {
  // run once, set theme, add event listener; stop event listener on dispose
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
