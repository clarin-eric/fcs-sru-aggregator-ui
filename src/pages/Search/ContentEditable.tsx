import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'

// --------------------------------------------------------------------------
// types

declare const window: Window &
  typeof globalThis & {
    clipboardData: DataTransfer
  }

// see helpers.d.ts from react-bootstrap
type Omit<T, U> = Pick<T, Exclude<keyof T, keyof U>>

interface NonUsableProps {
  contentEditable: never
  dangerouslySetInnerHTML: never
  onInput: never
  onPaste: never
  onKeyDown: never
}

export interface ContentEditableProps {
  value?: string
  disabled?: boolean
  isInvalid?: boolean
  placeholder?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
}

export type Props = Omit<React.ComponentProps<'div'>, NonUsableProps> & ContentEditableProps

// --------------------------------------------------------------------------

function getAbsoluteTextCursorOffsets(container: Node, range: Range) {
  if (!range) return null

  const start = getTextCursorOffset(container, range.startContainer, range.startOffset)

  // optimization if same node
  if (range.endContainer === range.startContainer) {
    return [start, start + (range.endOffset - range.startOffset)]
  }

  const end = getTextCursorOffset(container, range.endContainer, range.endOffset)

  return [start, end]
}

function getTextCursorOffset(container: Node, node: Node, offset: number = 0) {
  // no nested children
  if (node === container || container === null) return offset

  // go through parent and children until have our offset in the container
  const parent = node.parentNode
  // if parent is null then we can't do anything, offset should be correct?
  if (parent === null) return offset
  // otherwise find previous children
  let lengthBefore = 0
  const children = parent.childNodes
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child === node) break

    // store text length before
    if (child.nodeType === Node.TEXT_NODE) {
      lengthBefore += child.textContent?.length || 0
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // NOTE: innerText for visible text required?
      // see: https://stackoverflow.com/a/35213639/9360161
      lengthBefore += child.textContent?.length || 0
    } else {
      console.warn('unknown node type', child)
    }
  }

  // recurse up, until we have found our container
  return getTextCursorOffset(container, parent, lengthBefore + offset)
}

function getRangeContainerWithOffsetFromTextOffset(container: Node, offset: number) {
  // check if possible (e.g., container has enough text to contain the offset)
  const containerLength = container.textContent?.length || 0
  if (containerLength < offset) return null

  // go through children and find where offset could be
  let lengthBefore = 0
  const children = container.childNodes
  for (let i = 0; i < children.length; i++) {
    const child = children[i]

    let childLength = 0
    if (child.nodeType === Node.TEXT_NODE) {
      childLength = child.textContent?.length || 0
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      // NOTE: innerText for visible text required?
      // see: https://stackoverflow.com/a/35213639/9360161
      childLength = child.textContent?.length || 0
    } else {
      console.warn('unknown node type, skip', child)
    }
    if (childLength === 0) continue

    // check if with this child content, the offset is included
    lengthBefore += childLength
    if (lengthBefore >= offset) {
      // found, now only need to check if we need to go deeper
      const newOffset = offset - (lengthBefore - childLength)
      if (child.nodeType === Node.ELEMENT_NODE) {
        // we need to check deeper
        return getRangeContainerWithOffsetFromTextOffset(child, newOffset)
      } else {
        // otherwise this is it
        return { node: child, offset: newOffset }
      }
    }
  }
  console.warn('we should have found the offset ...', container, offset)
  return null
}

function sanitizeValue(value?: string | null) {
  if (!value) return ''

  // illegal whitespace
  value = value.replace(/\n\t/g, ' ')
  value = value.replace(/&nbsp;|\u202F|\u00A0/g, ' ')

  // HTML escape, entities
  value = value.replace(/&/g, '&amp;')
  // HTML
  value = value.replace(/</g, '&lt;')
  value = value.replace(/>/g, '&gt;')
  return value
}

function setCursorPosition(container: Node, offset: number) {
  const isTargetFocused = document.activeElement === container
  if (!isTargetFocused) return null

  const selection = window.getSelection()
  if (!selection) return null

  const range = document.createRange()
  const startRange = getRangeContainerWithOffsetFromTextOffset(container, offset)
  if (startRange) {
    range.setStart(startRange.node, startRange.offset)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

function getCursorPosition(container: Node) {
  const isTargetFocused = document.activeElement === container
  if (!isTargetFocused) return null

  const selection = window.getSelection()
  if (!selection) return null
  if (selection.rangeCount === 0) return null

  // only look at first range if multiple
  const range = selection.getRangeAt(0)
  const idxRange = getAbsoluteTextCursorOffsets(container, range)
  if (!idxRange) return null
  // only look at start of range
  return idxRange[0]
}

// --------------------------------------------------------------------------
// component

const ContentEditable = React.forwardRef<HTMLDivElement, Props>(
  ({ value, onChange, disabled, placeholder, ...props }, ref) => {
    // ref to hidden input element (for form stuffs)
    const inputRef = useRef<HTMLInputElement>(null)
    // ref to our contentEditable input
    const mRef = useRef<HTMLDivElement>(null)
    // allow forwardRefs but use our local one since we need access
    // see: https://stackoverflow.com/a/76739143/9360161
    useImperativeHandle(ref, () => mRef.current as HTMLDivElement)

    const [sanitizedValue, setSanitizedValue] = useState(sanitizeValue(value))
    const [cursorPos, setCursorPos] = useState<number | null>(null)

    useEffect(() => {
      // if (disabled) return

      setSanitizedValue(sanitizeValue(value))

      if (mRef.current) {
        const pos = getCursorPosition(mRef.current)
        setCursorPos(pos)
      }
    }, [value])

    useLayoutEffect(() => {
      if (mRef.current && cursorPos !== null) {
        // only if we have a valid cursor, otherwise let default behaviour do the work
        setCursorPosition(mRef.current, cursorPos)
      }
    })

    // ------------------------------------------------------------------------

    // TODO: syntax highlighting
    function fancifyValue(value: string) {
      // TODO: dummy, for testing only
      value = value.replace(/([abcdef]+)/g, `<i>$1</i>`)
      return value
    }

    // ------------------------------------------------------------------------
    // event handlers

    function handleInput(event: React.ChangeEvent<HTMLDivElement>) {
      const value = event.target.innerText
      // console.debug('[handleInput]', value)

      if (inputRef.current) {
        inputRef.current.value = value
      }

      onChange?.(value)
    }

    function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
      // console.debug('[handlePaste]', event)

      event.stopPropagation()
      event.preventDefault()

      // see: https://stackoverflow.com/a/6804718/9360161
      // Get pasted data via clipboard API
      const clipboardData = event.clipboardData || window.clipboardData
      const pastedData = clipboardData.getData('text')

      handleInsert(pastedData)
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      // console.debug('[handleKeyDown]', event)

      // TODO: handle Ctrl-Z?
      // NOTE: Ctrl-X / cut is handled
      // NOTE: (Shift-)Tab is handled

      if (event.key === 'Enter') {
        // console.debug('[handleKeyDown:Enter]')

        event.stopPropagation()
        event.preventDefault()

        if (inputRef.current) {
          // dispatching ENTER keydown events will not work because of trust issues

          // request submit directly via enclosing form
          // NOTE: will ignore disabled status of submit button...
          inputRef.current.form?.requestSubmit()
        }
      } else if (event.key === 'Backspace') {
        // console.debug('[handleKeyDown#Backspace]')

        event.stopPropagation()
        event.preventDefault()

        // custom backspace deletion handling since backspace on formatted text
        // will jump the cursor to the left more than expected???
        handleBackspace()
      } else if (event.key === 'Delete') {
        // console.debug('[handleKeyDown#Delete]')

        event.stopPropagation()
        event.preventDefault()

        handleDelete()
      } else {
        // default, do not attempt to set cursor
        setCursorPos(null)
      }
    }

    // ------------------------------------------------------------------------

    function doRemove(mode: 'delete' | 'backspace' | 'paste') {
      if (!mRef.current) return null

      const container = mRef.current
      const isTargetFocused = document.activeElement === container
      if (!isTargetFocused) return null

      const selection = window.getSelection()
      if (!selection) return null
      if (selection.rangeCount === 0) return null

      const selectionIndices: Array<number[]> = []
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i)
        const idxRange = getAbsoluteTextCursorOffsets(container, range)
        if (idxRange) selectionIndices.push(idxRange)
      }

      // nothing to do
      if (selectionIndices.length === 0) return null

      // sort, so we can delete correctly (from the back to keep indices valid)
      selectionIndices.sort()

      // how many chars will deleted
      const numDeleted = selectionIndices
        .map(([start, end]) => end - start)
        .reduce((acc, cur) => acc + cur, 0)

      const oldValue = container.innerText // TODO: use container.textContent?
      const newValueSpansRemoved = selectionIndices
        .toReversed()
        .reduce((text, [start, end]) => text.slice(0, start) + text.slice(end), oldValue)

      if (mode === 'backspace') {
        if (numDeleted === 0) {
          // then perform normal backspace operation
          const lastPos = selectionIndices
            .filter(([start, end]) => start === end)
            .map(([, end]) => end)
            .pop()

          if (lastPos !== undefined) {
            // should only be a single cursor! (multiple cursors are not supported by default in browsers?)
            const newValue =
              newValueSpansRemoved.slice(0, lastPos - 1) + newValueSpansRemoved.slice(lastPos)

            return { value: newValue, offset: lastPos - 1 }
          }
        } else {
          // from end of last selection minus deleted chars will be new pos
          // collapse multiple ranges into one for simplicity
          const lastPos = selectionIndices.map(([, end]) => end).pop()

          if (lastPos !== undefined) {
            return { value: newValueSpansRemoved, offset: lastPos - numDeleted }
          }
        }

        console.warn('invalid "backspace" process, abort', {
          container,
          selectionIndices,
          oldValue,
          newValueSpansRemoved,
          numDeleted,
        })
        return null
      } else if (mode === 'delete') {
        if (numDeleted === 0) {
          // then perform normal backspace operation
          const lastPos = selectionIndices
            .filter(([start, end]) => start === end)
            .map(([, end]) => end)
            .pop()

          if (lastPos !== undefined) {
            // should only be a single cursor! (multiple cursors are not supported by default in browsers?)
            const newValue =
              newValueSpansRemoved.slice(0, lastPos) + newValueSpansRemoved.slice(lastPos + 1)

            return { value: newValue, offset: lastPos }
          }
        } else {
          // from end of last selection minus deleted chars will be new pos
          // collapse multiple ranges into one for simplicity
          const lastPos = selectionIndices.map(([, end]) => end).pop()

          if (lastPos !== undefined) {
            return { value: newValueSpansRemoved, offset: lastPos - numDeleted }
          }
        }

        console.warn('invalid "delete" process, abort', {
          container,
          selectionIndices,
          oldValue,
          newValueSpansRemoved,
          numDeleted,
        })
        return null
      } else if (mode === 'paste') {
        if (numDeleted === 0) {
          // just find first position
          const firstPos = selectionIndices
            .filter(([start, end]) => start === end)
            .map(([start]) => start)
            .shift()

          if (firstPos !== undefined) {
            return { value: newValueSpansRemoved, offset: firstPos }
          }
        } else {
          const firstPos = selectionIndices.map(([start]) => start).shift()

          if (firstPos !== undefined) {
            return { value: newValueSpansRemoved, offset: firstPos }
          }
        }

        console.warn('invalid "paste" process, abort', {
          container,
          selectionIndices,
          oldValue,
          newValueSpansRemoved,
          numDeleted,
        })
        return null
      }
    }

    function handleInsert(value: string) {
      const result = doRemove('paste')
      if (!result) return

      const valueToInsertSanitized = sanitizeValue(value)

      const { value: newValue, offset: insertPos } = result
      const newValueWithInsert =
        newValue.slice(0, insertPos) + valueToInsertSanitized + newValue.slice(insertPos)
      const newCursorPos = insertPos + value.length

      setSanitizedValue(newValueWithInsert)
      setCursorPos(newCursorPos)

      if (inputRef.current) {
        inputRef.current.value = newValueWithInsert
      }
      onChange?.(newValueWithInsert)
    }

    function handleBackspace() {
      const result = doRemove('backspace')
      if (!result) return

      const { value: newValue, offset: newCursorPos } = result

      const sanitizedValue = sanitizeValue(newValue)

      setSanitizedValue(sanitizedValue)
      setCursorPos(newCursorPos)

      if (inputRef.current) {
        inputRef.current.value = sanitizedValue
      }
      // if (mRef.current) {
      //   mRef.current.innerHTML = fancifyValue(sanitizedValue)
      // }
      onChange?.(sanitizedValue)
    }

    function handleDelete() {
      const result = doRemove('delete')
      if (!result) return

      const { value: newValue, offset: newCursorPos } = result

      const sanitizedValue = sanitizeValue(newValue)

      setSanitizedValue(sanitizedValue)
      setCursorPos(newCursorPos)

      if (inputRef.current) {
        inputRef.current.value = sanitizedValue
      }
      onChange?.(sanitizedValue)
    }

    // ------------------------------------------------------------------------
    // UI

    return (
      <>
        <div
          role="input"
          // @ts-expect-error: expected, we want to set it for styling
          disabled={disabled}
          placeholder={placeholder}
          {...props}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : props.tabIndex}
          contentEditable // plaintext-only?
          dangerouslySetInnerHTML={{ __html: fancifyValue(sanitizedValue) }}
          ref={mRef}
        />
        {placeholder && value === '' && (
          <span className="input-placeholder-simulacrum">{placeholder}</span>
        )}
        {/* required for form submission */}
        <input type="hidden" ref={inputRef} />
      </>
    )
  }
)

// to make it show up in the dev tools
ContentEditable.displayName = 'ContentEditable'

export default ContentEditable
