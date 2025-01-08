import { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'

import useDebounce from '@/hooks/useDebounce'

// --------------------------------------------------------------------------

function DebouncedFuzzySearchInput({
  disabled,
  value,
  onChange,
  delay = 300,
}: {
  disabled: boolean
  value?: string
  onChange: (filter: string) => void
  delay?: number
}) {
  const [filter, setFilter] = useState(value ?? '')
  const deboundedFilter = useDebounce(filter, delay)

  useEffect(() => {
    onChange(deboundedFilter)
  }, [onChange, deboundedFilter])

  return (
    <Form.Control
      type="search"
      placeholder="Search for ..."
      value={filter}
      onChange={(event) => setFilter(event.target.value)}
      disabled={disabled}
    />
  )
}

export default DebouncedFuzzySearchInput
