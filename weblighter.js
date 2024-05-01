document.addEventListener('dblclick', (event) => {
  try {
    let rootNode = document.querySelector('body')
    let children = _.get(rootNode, 'children');
    let objToSave = { "highlights": [] }
    // storeAll(rootNode, children, objToSave);
    // download(objToSave, 'highlight-1.json')
    objToSave = {"highlights":[{"path":[2,0,0,0,0],"offsetStart":0,"offsetEnd":7},{"path":[2,0,0,1,0],"offsetStart":12,"offsetEnd":19},{"path":[2,0,0,1,1],"offsetStart":51,"offsetEnd":20},{"path":[2,0,0,1,2],"offsetStart":34,"offsetEnd":38},{"path":[2,1,2,0,0,0,0],"offsetStart":52,"offsetEnd":41},{"path":[2,1,5,0,1,0],"offsetStart":35,"offsetEnd":21}]}
    restoreHighlights(objToSave);
  } catch(err) {
    console.log(err);
  }
})

document.addEventListener('click', (event) => {
  const selection = window.getSelection();
  if (!selection.toString() || selection.toString().length == 0) {
    return;
  }
  const highlightFlag = isAlreadyHighlighted(selection);
  switch(highlightFlag) {
    case 0: {
      createHighlight(selection);
      break;
    }
    case 1: {
      removeHighlightSameNode(selection);
      break;
    }
    case 2: {
      console.log("In Progress")
      break;
    }
    case 3: {
      console.log("In Progress")
      break;
    }
  }
})

function createHighlight(selection) {
  // CASE 1: anchorNode is same as focusNode
  if (selection.anchorNode == selection.focusNode) {
    if (selection.anchorNode.nodeName !== "#text") {
      console.log("Not a valid selection", selection.anchorNode.nodeName);
      return;
    }
    // create the range of highlight
    const highlightRange = new Range();
    highlightRange.setStart(selection.anchorNode, selection.anchorOffset);
    highlightRange.setEnd(selection.focusNode, selection.focusOffset);
    // make the highlight!
    highlightRange.surroundContents(document.createElement('mark'));
  }
  // TODO CASE 2: anchorNode and focusNode are different
  else {
    console.log("Work in Progress ...");
  }
}

function shouldMergeNodes() {
}

function isAlreadyHighlighted(selection) {
  try {
    // CASE 1: anchorNode is same as focusNode
    if (
      !_.isNil(_.get(selection, 'anchorNode')) &&
      _.get(selection, 'anchorNode') == _.get(selection, 'focusNode')
    ) {
      // if the node is already highlighted, its parent would be a `mark` element
      if (_.get(selection, 'anchorNode.parentNode.nodeName') === "MARK") {
        return 1;
      }
    }
    // CASE 2: anchorNode and focusNode are different
    else {
      // if MARK is the sibling of the anchorNode 
      if (_.get(selection, 'anchorNode.nextElementSibling.nodeName') === "MARK") {
        console.log("Unhighlighted + Highlighted + ...");
        return 2;
      }
      else if (_.get(selection, 'focusNode.previousElementSibling.nodeName') === "MARK") {
        console.log("Highlighted + Unhighlighted + ...");
        return 3;
      }
      else {
      }
    }
  }catch(err) {
    console.log(err);
    return 0;
  }
  return 0;
}

function removeHighlightSameNode(selection) {
  let textNode = selection.anchorNode;
  let markNode = textNode.parentNode;
  let grandParent = markNode.parentNode;
  grandParent.insertBefore(textNode, markNode.nextSibling);
  // grandParent.insertBefore(markNode.previousSibling, textNode);
  grandParent.removeChild(markNode);
  grandParent.normalize();
}

function storeAll(rootNode, children, objToSave, path=[]) {
  try {
    if (_.get(rootNode, 'childElementCount') > 0) {
      // iterate DOM
      for (let i = 0; i < children.length; ++i) {
        let currentNode = children[i];
        if (_.get(currentNode, 'nodeName') === "MARK") {
           _.get(objToSave, 'highlights').push({
             "path": _.concat(path, i),
             "offsetStart": _.get(currentNode, 'previousSibling.length', 0),
             "offsetEnd": _.get(currentNode, 'innerText.length', 0)
           })
          console.log(_.last(_.get(objToSave, 'highlights')));
        }
        storeAll(
          currentNode,
          _.get(currentNode, 'children'),
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
      const { path, offsetStart, offsetEnd } = highlight;
      let node = document.querySelector('body')
      _.forEach(path, (childIndex, i) => {
        // stop with last-but-one
        if (i !== path.length - 1) {
          node = node.children[childIndex]
        }
      })
      let textNode = _.last(_.get(node, 'childNodes'));
      // if (_.last(path) === 0) {
      //   // TODO: check if node.childNodes has length = 1
      //   textNode = _.get(node, 'childNodes[0]')
      // }
      // else {
      //   textNode = _.last(_.get(node, 'childNodes'));
      // }
      // console.log(path);
      // console.log(node.childNodes);
      if (textNode) {
        // create the range of highlight
        const highlightRange = new Range();
        highlightRange.setStart(textNode, offsetStart);
        highlightRange.setEnd(textNode, offsetStart + offsetEnd);
        // make the highlight!
        highlightRange.surroundContents(document.createElement('mark'));
      }
    })
  } catch(err) {
    console.log(err)
  }
}

function download(objToSave, name) {
  var a = document.createElement('a');
  var file = new Blob([JSON.stringify(objToSave)], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}
