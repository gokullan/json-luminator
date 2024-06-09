function storeAll(rootNode, objToSave, path=[]) {
  const children = _.get(rootNode, 'childNodes');
  try {
    if (!_.isEmpty(children) && !_.isNil(children)) {
      // iterate DOM
      for (let i = 0; i < children.length; ++i) {
        let currentNode = children[i];
        if (_.get(currentNode, 'nodeName') === "MARK") {
          console.log(currentNode, getFirstTextNode(currentNode));
          _.get(objToSave, 'highlights').push({
            "path": _.concat(path, i),
            // "anchorOffset": _.get(currentNode, 'previousSibling.length', 0),
            "anchorOffset": _.get(
              getLastTextNode(_.get(currentNode, 'previousSibling')),
              'length',
              0
            ),
            "nextTextNodeLength": _.get(
              getFirstTextNode(_.get(currentNode, 'nextSibling')),
              'length',
              0
            ),
            "n": currentNode.childNodes.length,
            "firstTextNodeLength": _.get(
              getFirstTextNode(currentNode),
              'length',
              0
            ),
            "lastTextNodeLength": _.get(
              getLastTextNode(currentNode),
              'length',
              0
            ),
          })
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
