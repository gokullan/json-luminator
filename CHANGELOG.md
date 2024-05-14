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
