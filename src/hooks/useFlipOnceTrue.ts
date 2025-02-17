import { useState } from 'react'

// export default function useToggleOnce<T>(
//   value: T | (() => T)
// ): [T, React.Dispatch<React.SetStateAction<T>>] {
//   const [state, setState] = useState(value)

//   const toggleOnce: React.Dispatch<React.SetStateAction<T>> = (value: React.SetStateAction<T>) => {
//     // use state/ref to check if triggered / or even a local var?
//     setState(value)
//   }
//   return [state, toggleOnce]
// }

export default function useFlipOnceTrue(): [boolean, () => void] {
  const [state, setState] = useState(false)

  const flipOnce = () => {
    if (state !== true) setState(true)
  }
  return [state, flipOnce]
}
