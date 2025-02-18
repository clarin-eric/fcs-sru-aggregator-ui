import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'

import useDebounce from '@/hooks/useDebounce'
import { type QueryTypeID } from '@/utils/constants'
import { getAbsoluteTextCursorOffsets, getCursorPosition, setCursorPosition } from '@/utils/cursor'
import { highlightSyntax } from '@/utils/prism'

import '@vendor/prismjs/themes/prism-vs.css'
import './styles.css'

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
  onKeyUp: never
  onClick: never
}

export interface ContentEditableProps {
  value?: string
  disabled?: boolean
  isInvalid?: boolean
  placeholder?: string
  queryType?: QueryTypeID
  delay?: number
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  onCursorChange?: (startPos: number | null, endPos?: number) => void
}

export type Props = Omit<React.ComponentProps<'div'>, NonUsableProps> & ContentEditableProps

// --------------------------------------------------------------------------

function sanitizeValue(value?: string | null) {
  if (!value) return ''

  // illegal whitespace
  value = value.replace(/[\n\t]/g, ' ')
  value = value.replace(/&nbsp;|\u202F|\u00A0/g, ' ')

  // NOTE: not required for for pre/code
  // HTML escape, entities
  // value = value.replace(/&/g, '&amp;')
  // HTML
  // value = value.replace(/</g, '&lt;')
  // value = value.replace(/>/g, '&gt;')
  return value
}

// --------------------------------------------------------------------------
// component

const ContentEditable = React.forwardRef<HTMLDivElement, Props>(
  (
    { value, onChange, onCursorChange, disabled, placeholder, queryType, delay = 200, ...props },
    ref
  ) => {
    // ref to hidden input element (for form stuffs)
    const inputRef = useRef<HTMLInputElement>(null)
    // ref to our contentEditable input
    const mRef = useRef<HTMLDivElement>(null)
    // allow forwardRefs but use our local one since we need access
    // see: https://stackoverflow.com/a/76739143/9360161
    useImperativeHandle(ref, () => mRef.current as HTMLDivElement)

    const [sanitizedValue, setSanitizedValue] = useState(sanitizeValue(value))
    const [cursorPos, setCursorPos] = useState<number | null>(null)

    // debounce to avoid unnecessary repeated calls to highlighter if value stays the same
    const deboundedSanitizedValue = useDebounce(sanitizedValue, delay)
    const [htmlValue, setHtmlValue] = useState(deboundedSanitizedValue)
    useEffect(() => {
      const valueWithStyle = highlightSyntax(deboundedSanitizedValue, queryType)
      setHtmlValue(valueWithStyle)

      if (mRef.current) {
        const pos = getCursorPosition(mRef.current)
        setCursorPos(pos)
      }
    }, [deboundedSanitizedValue, queryType])

    // set visible value
    useEffect(() => {
      // if (disabled) return

      const newValue = sanitizeValue(value)

      // detection if already styled and we do not need to restyle again
      if (deboundedSanitizedValue === newValue) return

      setSanitizedValue(newValue)
      // we still need to set the value (without styling) to show the current value to the user
      setHtmlValue(highlightSyntax(newValue))

      if (mRef.current) {
        const pos = getCursorPosition(mRef.current)
        setCursorPos(pos)
      }
    }, [value, deboundedSanitizedValue])

    // set cursor position
    useLayoutEffect(() => {
      if (mRef.current && cursorPos !== null) {
        // only if we have a valid cursor, otherwise let default behaviour do the work
        // console.debug('[useLayoutEffect#setCursorPosition]', cursorPos)
        setCursorPosition(mRef.current, cursorPos)
      }
    })

    // ------------------------------------------------------------------------
    // event handlers

    function handleInput(event: React.ChangeEvent<HTMLDivElement>) {
      const value = event.target.innerText
      // console.debug('[handleInput]', value)

      if (inputRef.current) {
        inputRef.current.value = value
      }

      // TODO: might be required?
      setSanitizedValue(value)

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
      // console.debug('[handleKeyDown]', event.key, event)

      // TODO: handle Ctrl-Z?
      // NOTE: Ctrl-X / cut is handled
      // NOTE: (Shift-)Tab is handled

      // TODO: handle Ctrl-A Delete/Backspace
      // TODO: handle Home/End <any-input>

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
      } else if (event.ctrlKey && event.key === 'a') {
        // TODO: required?
        // if (mRef.current) {
        //   const selection = window.getSelection()
        //   if (selection) {
        //     const range = document.createRange()
        //     range.selectNodeContents(mRef.current)
        //     selection.removeAllRanges()
        //     selection.addRange(range)
        //     event.stopPropagation()
        //     event.preventDefault()
        //   }
        // }
      } else {
        // default, do not attempt to set cursor
        setCursorPos(null)
      }
    }

    function handlePossibleCursorChange(isClick: boolean = false) {
      // if no element or no event handler, then skip everything
      if (!mRef.current) return
      if (!onCursorChange) return

      const container = mRef.current
      const isTargetFocused = document.activeElement === container
      if (!isTargetFocused) return

      const selection = window.getSelection()
      if (!selection) return
      if (selection.rangeCount === 0) return

      const selectionIndices: Array<readonly [number, number]> = []
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i)
        const idxRange = getAbsoluteTextCursorOffsets(container, range)
        if (idxRange) selectionIndices.push(idxRange)
      }
      if (selectionIndices.length === 0) return

      // use last selection as most current one
      const [start, end] = selectionIndices.pop()!

      // only trigger if selection is a single cursor, not for ranges
      if (isClick) {
        if (start === end) {
          setCursorPos(start)
          onCursorChange?.(start)
          // } else {
          // NOTE: this does not work, maybe due to re-rendering
          // onCursorChange?.(start, end)
        }
      } else {
        onCursorChange?.(start, start !== end ? end : undefined)
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

      const selectionIndices: Array<readonly [number, number]> = []
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

      // console.debug('deleting', { mode, oldValue, length: oldValue.length, newValueSpansRemoved, numDeleted, selectionIndices })

      if (mode === 'backspace') {
        if (numDeleted === 0) {
          // then perform normal backspace operation
          const lastPos = selectionIndices
            .filter(([start, end]) => start === end)
            .map(([, end]) => end)
            .pop()

          // did delete nothing and am at start
          if (lastPos === 0) return null

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
      onCursorChange?.(newCursorPos)
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
      onCursorChange?.(newCursorPos)
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
      onCursorChange?.(newCursorPos)
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
          spellCheck={false} // can be overwritten
          autoCapitalize="off"
          autoCorrect="off"
          {...props}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onKeyUp={() => handlePossibleCursorChange()}
          onClick={() => handlePossibleCursorChange(true)}
          tabIndex={disabled ? -1 : props.tabIndex}
          contentEditable // plaintext-only?
          dangerouslySetInnerHTML={{ __html: htmlValue }}
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
