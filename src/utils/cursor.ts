function getTextCursorOffset(
  container: Node,
  node: Node,
  offset: number = 0,
  selectionNode: Node = node
) {
  // TODO: or is this only for the container element?
  if (
    node === container &&
    node === selectionNode &&
    node.nodeType === Node.ELEMENT_NODE &&
    offset === 1
  ) {
    console.debug('offset=1 on node', {
      container,
      node,
      nodeType: node.nodeType,
      offset,
      length: node.textContent?.length,
    })
    return node.textContent?.length || 0
  }

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
      console.warn('unknown node type', { container, node, offset, parent, i, child })
    }
  }

  // recurse up, until we have found our container
  // console.debug('[getTextCursorOffset]#recurse', { container, selectionNode, node, parent, lengthBefore, offset })
  return getTextCursorOffset(container, parent, lengthBefore + offset, selectionNode)
}

function getRangeContainerWithOffsetFromTextOffset(container: Node, offset: number) {
  // TODO: may be enough if at start ...?
  // if (offset === 0) {
  //   return { node: container, offset: offset }
  // }

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
      console.warn('unknown node type, skip', { container, offset, child })
    }
    // skip if empty child, but do not skip if only child
    if (childLength === 0 && children.length !== 1) continue

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
  console.debug('we should have found the offset ...', {
    container,
    containerLength,
    children,
    childrenCount: children.length,
    offset,
  })
  return null
}

// --------------------------------------------------------------------------

export function getAbsoluteTextCursorOffsets(container: Node, range: Range) {
  if (!range) return null

  const start = getTextCursorOffset(container, range.startContainer, range.startOffset)

  // optimization if same node
  if (
    range.startContainer.nodeType === Node.TEXT_NODE &&
    range.endContainer === range.startContainer
  ) {
    return [start, start + (range.endOffset - range.startOffset)] as const
  }

  const end = getTextCursorOffset(container, range.endContainer, range.endOffset)

  // console.debug('[getAbsoluteTextCursorOffsets]', {
  //   container,
  //   range,
  //   startContainer: range.startContainer,
  //   startOffset: range.startOffset,
  //   endContainer: range.endContainer,
  //   endOffset: range.endOffset,
  //   start,
  //   end,
  // })

  return [start, end] as const
}

export function setCursorPosition(container: Node, offset: number) {
  // console.debug('[setCursorPosition]', offset)
  const isTargetFocused = document.activeElement === container
  if (!isTargetFocused) return null

  const selection = window.getSelection()
  if (!selection) return null

  const range = document.createRange()
  const startRange = getRangeContainerWithOffsetFromTextOffset(container, offset)
  if (startRange) {
    try {
      range.setStart(startRange.node, startRange.offset)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    } catch (error) {
      console.error('Error trying to set cursor!', error, { container, offset, startRange })
    }
  }
}

export function getCursorPosition(container: Node) {
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
