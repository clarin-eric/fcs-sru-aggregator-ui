import { useEffect } from 'react'

// from: https://stackoverflow.com/a/34425083/9360161

function addScriptActions(url: string): [() => void, () => void] {
  let script: HTMLScriptElement | null = null
  const container = document.body

  function addScript() {
    script = document.createElement('script')

    script.src = url
    script.async = true

    container.appendChild(script)
  }

  function removeScript() {
    if (script === null) return

    container.removeChild(script)
  }

  return [addScript, removeScript]
}

export default function useScript(
  url: string | null | undefined,
  { delay = undefined }: { delay?: number } = {}
) {
  useEffect(() => {
    if (!url) return

    const [addScript, removeScript] = addScriptActions(url)

    let timeoutId: NodeJS.Timeout | undefined = undefined
    if (delay !== undefined && delay > 0) {
      timeoutId = setTimeout(() => {
        addScript()
      }, delay)
    } else {
      addScript()
    }

    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      removeScript()
    }
  }, [url, delay])
}
