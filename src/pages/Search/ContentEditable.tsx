import React, { useImperativeHandle, useRef } from 'react'

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
    const inputRef = useRef<HTMLInputElement>(null)
    const mRef = useRef<HTMLDivElement>(null)
    // allow forwardRefs but use our local one since we need access
    // see: https://stackoverflow.com/a/76739143/9360161
    useImperativeHandle(ref, () => mRef.current as HTMLDivElement)

    const sanitizedValue = sanitizeValue(value)
    const defaultValue = useRef(sanitizedValue)

    if (mRef && mRef.current) {
      const mValue = mRef.current.innerText
      console.debug('[root]', { mValue, value, sanitizedValue })
      if (mValue !== value) {
        // update our value when change from outside
        defaultValue.current = sanitizedValue
      } else {
        // update on change in "textfield" (inside)

        updateInnerHTMLWithCursors(fancifyValue(sanitizedValue))
      }

      // TODO: update when inside, so textual content is same but we want to add highlighting
      // need to keep cursor
    }

    // ------------------------------------------------------------------------

    function updateInnerHTMLWithCursors(value: string) {
      if (!mRef.current) return

      const container = mRef.current
      const isTargetFocused = document.activeElement === container

      let selectionIndices = null
      const selection = window.getSelection()

      // query initial cursor position (if possible)
      if (isTargetFocused && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        selectionIndices = getAbsoluteTextCursorOffsets(container, range)

        console.log('selection before', range, selectionIndices, {
          container: container.textContent,
          value,
          sanitizedValue,
          defaultValue: defaultValue.current,
        })
      }

      // update element content
      mRef.current.innerHTML = value

      // try to restore cursor position
      if (isTargetFocused && selection) {
        const range = document.createRange()

        if (selectionIndices) {
          console.log('[updateInnerHTMLWithCursors] set range', selectionIndices[0])

          const startRange = getRangeContainerWithOffsetFromTextOffset(
            container,
            selectionIndices[0]
          )
          if (startRange) {
            range.setStart(startRange.node, startRange.offset)

            const endRange = getRangeContainerWithOffsetFromTextOffset(
              container,
              selectionIndices[1]
            )
            if (endRange) {
              range.setEnd(endRange.node, endRange.offset)
            } else {
              range.collapse(true)
            }
          }
        } else {
          // TODO: unsure?
          console.warn('something unsure happened')
          range.setStart(container, container.textContent?.length ?? 0)
          range.collapse(true)
        }

        selection.removeAllRanges()
        selection.addRange(range)
      }
    }

    function doRemove(lastRange: boolean) {
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
        if (idxRange && idxRange[0] !== 0 && idxRange[1] !== 0) selectionIndices.push(idxRange)
      }

      // nothing to do
      if (selectionIndices.length === 0) return null

      if (lastRange) {
        // sort, so we can delete correctly (from the back to keep indices valid)
        selectionIndices.sort().reverse()

        // how many chars deleted
        const numDeleted = selectionIndices
          .map(([start, end]) => (start < end ? end - start : 1))
          .reduce((acc, cur) => acc + cur, 0)
        // from end of last selection minus deleted chars will be new pos
        // collapse multiple ranges into one for simplicity
        const newCursorPos = selectionIndices[0][1] - numDeleted

        const oldValue = container.innerText
        const newValue = selectionIndices.reduce(
          (text, [start, end]) =>
            start < end
              ? text.slice(0, start) + text.slice(end)
              : text.slice(0, start - 1) + text.slice(start),
          oldValue
        )

        return { value: newValue, offset: newCursorPos }
      } else {
        // sort, so we can delete correctly (from the back to keep indices valid)
        selectionIndices.sort()

        // find first selection
        const newCursorPos = selectionIndices[0][1]

        const oldValue = container.innerText
        const newValue = selectionIndices
          .toReversed()
          .reduce((text, [start, end]) => text.slice(0, start) + text.slice(end), oldValue)

        return { value: newValue, offset: newCursorPos }
      }
    }

    function setCursor(offset: number) {
      if (!mRef.current) return null
      setCursorPosition(mRef.current, offset)
    }

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
      console.debug('[handleInput]', value)

      if (inputRef.current) {
        inputRef.current.value = value
      }

      onChange?.(value)
    }

    function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
      console.debug('[handlePaste]', event)

      // event.stopPropagation()
      // event.preventDefault()

      // see: https://stackoverflow.com/a/6804718/9360161
      // Get pasted data via clipboard API
      const clipboardData = event.clipboardData || window.clipboardData
      const pastedData = clipboardData.getData('text')

      // sanitize input
      // const sanitizedData = sanitizeValue(pastedData)

      handleInsert(pastedData)
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      // console.debug('[handleKeyDown]', event)

      if (event.key === 'Enter') {
        console.debug('[handleKeyDown:Enter]')

        event.stopPropagation()
        event.preventDefault()

        if (inputRef.current) {
          // dispatching ENTER keydown events will not work because of trust issues

          // request submit directly via enclosing form
          // NOTE: will ignore disabled status of submit button...
          inputRef.current.form?.requestSubmit()
        }
      } else if (event.key === 'Backspace') {
        console.debug('[handleKeyDown#Backspace]')

        event.stopPropagation()
        event.preventDefault()

        // custom backspace deletion handling since backspace on formatted text
        // will jump the cursor to the left more than expected???
        handleDelete()
      }
    }

    function handleInsert(value: string) {
      const result = doRemove(false)
      if (!result) return

      const { value: newValue, offset: insertPos } = result
      const newValueWithInsert = newValue.slice(0, insertPos) + value + newValue.slice(insertPos)
      const newCursorPos = insertPos + value.length

      // update value
      const sanitizedValue = sanitizeValue(newValueWithInsert)
      defaultValue.current = sanitizedValue
      if (inputRef.current) {
        inputRef.current.value = sanitizedValue
      }
      if (mRef.current) {
        mRef.current.innerHTML = fancifyValue(sanitizedValue)
      }
      onChange?.(sanitizedValue)

      // set cursor
      setCursor(newCursorPos)
    }

    function handleDelete() {
      const result = doRemove(true)
      if (!result) return

      const { value: newValue, offset: newCursorPos } = result

      const sanitizedValue = sanitizeValue(newValue)
      defaultValue.current = sanitizedValue
      if (inputRef.current) {
        inputRef.current.value = sanitizedValue
      }
      if (mRef.current) {
        mRef.current.innerHTML = fancifyValue(sanitizedValue)
      }
      onChange?.(sanitizedValue)

      setCursor(newCursorPos)
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
          contentEditable // plaintext-only?
          dangerouslySetInnerHTML={{ __html: fancifyValue(defaultValue.current) }}
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
