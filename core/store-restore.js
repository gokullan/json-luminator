function storeAll(rootNode, objToSave, path=[]) {
  const children = _.get(rootNode, 'childNodes');
  try {
    if (!_.isEmpty(children) && !_.isNil(children)) {
      // iterate DOM
      for (let i = 0; i < children.length; ++i) {
        let currentNode = children[i];
        // TODO: Add more validations and refactor
        if (_.get(currentNode, 'nodeName') === "MARK") {
          const properties = fetchPropertiesFromClassNames(currentNode)
          if (properties.isAnchorNode) {
            const { focusNode, focusOffset, n } = getHighlightEndNode(currentNode.childNodes[0])
            const childIndex = properties.anchorOffset > 0? i: i - 1; 
            _.get(objToSave, 'highlights').push({
              "path": _.concat(path, childIndex),
              "anchorOffset": properties.anchorOffset,
              "focusOffset": focusOffset,
              "n": n
            })
          }
        }
        storeAll(
          currentNode,
          objToSave,
          _.concat(path, i)
        )
      }
    }
  } catch(err) {
    console.log(err);
  }
}

function fetchPropertiesFromClassNames(markNode) {
  let properties = {
    'isAnchorNode': false,
    'isFocusNode': false,
    'anchorOffset': null,
    'focusOffset': null
  }
  // console.log(`ClassNames : ${markNode.className}`)
  let classNames = _.get(markNode, 'className', '').split(" ")
  for (let className of classNames) {
    // TODO: Ensure no other class-name starts with the below 2 keywords
    if (className.startsWith('highlight-start')) {
      properties.isAnchorNode = true;
      properties.anchorOffset = _.last(className.split('-'))
    }
    if (className.startsWith('highlight-end')) {
      properties.isFocusNode = true;
      properties.focusOffset = _.last(className.split('-'))
    }
  }
  return properties;
}

// return focusNode, focusOffset and n
// assumes markNode has the 'highlight-start-*' class
function getHighlightEndNode(textNode) {
  let focusNode = null, focusOffset = null, n = 0
  // assumes that the textNode has markNode as parent
  let properties = fetchPropertiesFromClassNames(textNode.parentNode)
  while (textNode && !properties.isAnchorNode && !properties.isFocusNode) {
    textNode = getPreviousOrNextTextNode(textNode, 'n')
    properties = fetchPropertiesFromClassNames(textNode.parentNode)
    n += 1
  }
  // log errors for other cases
  if (properties.isFocusNode) {
    focusNode = textNode 
    focusOffset = properties.focusOffset
  }
  return { focusNode, focusOffset, n }
}

function restoreHighlights(savedObj) {
  try {
    const savedHighlights = _.get(savedObj, 'highlights', []);
    _.forEach(savedHighlights, (highlight) => {
      try {
        let { path, anchorOffset, nextTextNodeLength, n, firstTextNodeLength, lastTextNodeLength } = highlight;
        console.log(path);
        let node = document.querySelector('body')
        _.forEach(path, (childIndex, i) => {
          // stop with last-but-one
          if (i !== path.length - 1) {
            node = node.childNodes[childIndex]
          }
        })
        let anchorNode, focusNode, focusOffset = lastTextNodeLength;
        let markNodePosition = _.last(path);
        if (markNodePosition <= node.childNodes.length) {
          const possibleAnchorNode =  getLastTextNode(
            _.get(node, `childNodes.${markNodePosition - 1}`)
          );
          if (!possibleAnchorNode) {
            anchorOffset = 0;
            anchorNode = getLastTextNode(
              _.get(node, `childNodes.${markNodePosition}`)
            );
            focusNode = getFirstTextNode(
              _.get(node, `childNodes.${(markNodePosition - 1) + n}`)
            );
          }
          // CASE 1: `possibleAnchorNode` is the anchorNode
          else if (
            n == 1 &&
            _.get(getLastTextNode(possibleAnchorNode), 'length') ==
            anchorOffset + firstTextNodeLength + nextTextNodeLength
          ) {
            anchorNode = possibleAnchorNode;
            focusNode = anchorNode;
            focusOffset += anchorOffset;
          }
          else if (
            _.get(getFirstTextNode(possibleAnchorNode), 'length') ==
            anchorOffset + firstTextNodeLength
          ) {
            console.log("Case of split")
            n--;
            anchorNode = possibleAnchorNode; 
            focusNode = getFirstTextNode(
              _.get(node, `childNodes.${(markNodePosition - 1) + n}`)
            );
          }
          else {
            console.log("Case of no split nor merge")
            anchorNode = getLastTextNode(
              _.get(node, `childNodes.${markNodePosition}`)
            );
            focusNode = anchorNode;
            anchorOffset = 0;
          }
        }
        else {
          console.log("Case of merge");
          anchorNode = possibleAnchorNode;
          focusNode = _.get(node, `childNodes.${(markNodePosition - 1) + n}`);
        }
        createHighlight({
          anchorNode,
          anchorOffset,
          focusNode,
          focusOffset
        })
      } catch(err) {
        console.log(err);
      }
    })
  } catch(err) {
    console.log(err)
  }
}
