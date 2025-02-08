import { useEffect, useState } from 'react'

// from: https://stackoverflow.com/a/77124113/9360161
// also: https://www.dhiwise.com/post/ultimate-guide-to-implementing-react-debounce-effectively

// value should be a state
export default function useDebounce<T>(value: T, delay?: number): T {
  const [debounceValue, setDebounceValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debounceValue
}
