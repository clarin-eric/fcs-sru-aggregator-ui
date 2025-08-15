import { useEffect, useRef } from 'react'

// credit: https://stackoverflow.com/a/57706747/9360161
// TODO: look into https://stackoverflow.com/a/59307806/9360161

export default function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
