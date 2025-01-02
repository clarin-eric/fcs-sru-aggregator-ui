import { useEffect, useState } from 'react'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
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
    <FloatingLabel label="Resource filter query" controlId="resource-view-options-filter">
      <Form.Control
        type="search"
        placeholder="Search for ..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        disabled={disabled}
      />
    </FloatingLabel>
  )
}

export default DebouncedFuzzySearchInput
