# Weblighter

## Scope
- Highlight on selection (support both left-to-right and right-to-left selection)
- Offer multiple colors for highlights
- Storage persistence through files and cookies

## Highlighting Logic
- **ASSUMPTION**: Anchor and focus nodes are always text-nodes
- Based on the direction of selection, determine the positions (left or right) of the anchor and focus nodes
- Traverse the elements encompassing the selection from left to right
- During traversal, perform the following actions:
  - Surround each encountered text-node with the `mark` tag, with the below exceptions
    - For the anchor node, the starting position of the highlight will be from `anchorOffset`
    - For the focus node, the ending position of the highlight will be `focusOffset`
  - Insert classes for the `mark` nodes surrounding the anchor and foucs nodes
    - `highlight-g` ("g" for "generic") to be given for all highlights made
    - Anchor node
      - `highlight-start-s` if the highlight requires a split from an existing node; `highlight-start-n` for no split
    - Focus node
      - `highlight-end-s` if the highlight requires a split from an existing node; `highlight-end-n` for no split
- `Range.surroundContents` will be used to surround all necessary nodes with the `mark` tag
  - This will be used twice or thrice for a single highlight - once for the anchor-node, once for the foucs-node and another encompassing the nodes in-between (if any).

## Removal of Highlights
- Need to ensure: DOM after removal of highlights = DOM before highlighting (for the specified nodes)
- Check whether merging of adjacent text nodes to be done 
- If `highlight-start-n` or `highlight-end-n`, no need of merging
- If `highlight-start-s` or `highlight-end-s`, merging to be done if adjacent nodes exist

```
n = anchorNode
LOOP until n is focusNode
  n2 = getNextTextNode(n)
  m = newMarkNode()
  n2.surroundContents(m)
  n = n2
```

## Persistence Logic
### Storing
- Start traversal from `body`
- If a node with class-name `highlight-start` is reached, store the following entry
```
{
  "path": "{{pathTakenToReachThisNode}}",
  "anchorOffset": "{{anchorOffset}}"

}
```
- Upon reaching the node with class-name `highlight-end`, modify the previous entry by adding 2 additional fields
  - **ASSUMPTION**: There is always a corresponding `highlight-end` class for each `highlight-start` class
  - Some validation needs to be done for the above
```
{  ...,
  "n": "{{numberOfNodesToTraverseFromAnchorNodeToReachFocusNode}}",
  "focusOffset": "{{focusOffset}}"
}
```
- Since the traversal is deterministic, `n` is sufficient to reach the focus-node from the anchor-node
  - Note that this won't work if there is a change in the DOM structure
  - There needs to be an additional logic to ensure that the highlighting itself does not happen in these cases
### Restoring
- For each stored highlight-entry, traverse `n` nodes starting after the anchor-node
  - The `n`th node will be the foucs-node
- Highlight the required nodes while making this traversal
  - There needs to be some logic to ensure the foucs-node is reachable from the anchor-node

