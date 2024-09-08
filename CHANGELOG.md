# Weblighter

## Phase 1 &#x2705;
- [x] Setup extension skeleton / debugging environment
- [x] Highlight selected text

**Comments**
- Highlight done using `mouseup` event and `Range` interface
- `web-ext` installed to test extension

## Phase 2
- [x] De-highlight already highlighted text
- Double-clicking to de-highlight does not work (anchor and focus-nodes are different but they are the ones surronding the actual selected text)
- How to get parent of offset of anchorNode?

## Phase 3
- [x] Highlight persistence - 1: Store / load from a fixed file

TODO:
1. [ ] `createHighlight` fix
Analysis:
- `surroundContents` is preferred due to its proper (expected) encapsulation of the highlighted nodes.
- It works only when there is no split required at a non-text node level
Tasks:
- Formulate the following
  - [ ] "Split required at a non-text node level"
- Write custom `Range.insertNode` function considering cases where `surroundContents` needs to be used.
CHANGE OF IDEA
- Don't do `surroundContents` at all - `mark` node to be present as parent of only text-nodes
- Encompassing of multiple nodes is not allowed - use separate `mark` nodes for each node encompassing the selection.
- This simplifies a lot of logic and makes storing-restoring easier as well.
- Removing highlights becomes a bit complex. Use "markers" to indicate `mark` nodes that are part of the same highlight
2. [ ] Fix additional empty-node in `removeHighlight`
- Design a "getNextNode" function (which just traverses level-up until it reaches the limit or a sibling)

## Phase 4
- [ ] Highlight persistence - 2 : Store / load from file-system
- [ ] Class-name

## Phase 5
- [ ] Popup design and development
- [ ] Notes design

## Phase 6
- [ ] Check info about notifications and deploy if feasible
- [ ] Notes - 1
  - Add new note to a given highlight

## Phase 7
- [ ] Notes - 2
  - Edit / update note 

## Others
- Undo/ Redo
- Highlight different blocks in one go
- Merging highlights (context: when part of the selection is highlighted)
- Storage improvement
