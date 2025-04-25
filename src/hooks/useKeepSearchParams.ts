import { useSearchParams } from 'react-router'

import { REQ_PARAM_CONSORTIA } from '@/utils/api'

// --------------------------------------------------------------------------

export const KEEP_PARAMS = [REQ_PARAM_CONSORTIA]

export default function useKeepSearchParams() {
  const [urlSearchParams] = useSearchParams()

  // filter search parameters to those we want to persist
  const params = new URLSearchParams(
    Array.from(urlSearchParams.entries()).filter(([name]) => KEEP_PARAMS.includes(name))
  )

  if (!params.entries().next().done) {
    return `?${params}`
  }
  return undefined
}
