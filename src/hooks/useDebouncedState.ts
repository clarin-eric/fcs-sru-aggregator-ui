import { useCallback, useRef, useState } from 'react'

export default function useDebouncedState<T>(
  initialValue: (() => T) | T,
  delay: number
): [T, (valueLater: T) => void, (valueNow: T) => void] {
  const [value, setValue] = useState(initialValue)
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined)

  const setValueDebounced = useCallback(
    (value: T) => {
      clearTimeout(timeoutId.current)
      timeoutId.current = setTimeout(() => {
        setValue(value)
      }, delay)
    },
    [setValue, delay]
  )

  // value, setValue, setValueImmediate
  return [value, setValueDebounced, setValue] as const
}
