import { useEffect, useState } from 'react'

// from: https://stackoverflow.com/a/77124113/9360161

export default function useDebounce<T>(cb: T, delay?: number): T {
  const [debounceValue, setDebounceValue] = useState(cb)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(cb)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [cb, delay])
  return debounceValue
}
