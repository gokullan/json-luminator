(function() {
  class MyLodash {
    constructor() {}

    isEmpty(obj) {
      if (obj) {
        return this.isNil(obj.length)
      }
      return true
    }

    isNil(obj) {
      return obj ? false : true;
    }

    get(obj, path, defaultVal) {
      let pathSplits = path.split('.')
      let curr = obj;
      for (let split of pathSplits) {
        if (this.isNil(curr)) {
          return defaultVal
        }
        curr = curr[split]
      }
      return curr;
    }
  }

  function getDisplayType (element) {
      var cStyle = element.currentStyle || window.getComputedStyle(element, ""); 
      return cStyle.display;
  }

  function getFirstOrLastTextNode(node, position, options = {}) {
    // TODO: Any upper limit needed for recursion?
    try {
      let possibleResultNode;

      if (!lodash.isNil(possibleResultNode = returnTextNodeIfValid(node, options))) {
        return possibleResultNode;
      }

      const childNodes = lodash.get(node, 'childNodes');
      // no child nodes => return null
      if (lodash.isEmpty(childNodes)) {
        return null;
      }

      function getFirstTextNode() {
        for (let child of childNodes) {
          if (!lodash.isNil(
              possibleResultNode = getFirstOrLastTextNode(child, position, {
                ...options,
                isRoot: false
              })
            )) {
            return possibleResultNode
          }
          // else keep searching
        }
      }

      function getLastTextNode() {
        for (let i = childNodes.length - 1; i >= 0; --i) {
          const child = childNodes[i];
          if (!lodash.isNil(
              possibleResultNode = getFirstOrLastTextNode(child, position, {
                ...options,
                isRoot: false
              })
            )) {
            return possibleResultNode;
          }
          // else keep searching
        }
      }

      switch (position) {
        case 'f': {
          return getFirstTextNode();
        }
        case 'l': {
          return getLastTextNode();
        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  function returnTextNodeIfValid(node, options = {}) {
    if (lodash.isNil(node)) {
      return null;
    }
    const {
      excludeEmptyNodes,
      isRoot,
      upperLimitNode = null
    } = options;
    if (!isRoot && lodash.get(node, 'nodeName') === '#text') {
      if (!lodash.isNil(upperLimitNode) && node.isEqualNode(upperLimitNode)) {
        return null;
      }
      if (
        !excludeEmptyNodes ||
        excludeEmptyNodes && lodash.get(node, 'length')
      ) {
        return node;
      }
    }
    return null;
  }

  function getPreviousOrNextTextNode(node, position, options = {}) {
    try {
      let possibleResultNode;

          if (options.isRoot && node.isEqualNode(options.upperLimitNode)) {
      return null;
    }
      
      if (!lodash.isNil(possibleResultNode = returnTextNodeIfValid(node, options))) {
        return possibleResultNode;
      }

      function _getPreviousOrNextTextNode(traversalProperty, descendantTraversalLogic) {
        let currentNode = node;
        let parentNode = lodash.get(currentNode, 'parentNode');
        // traverse left/right on the same level
        while (currentNode) {
          currentNode = lodash.get(currentNode, traversalProperty);
          if (!lodash.isNil(
              // TODO: The name `isRoot` is misleading here
              possibleResultNode = returnTextNodeIfValid(currentNode, {
                ...options,
                isRoot: false
              })
            )) {
            return possibleResultNode;
          } else if (!lodash.isNil(
              // check descendants
              possibleResultNode = getFirstOrLastTextNode(currentNode, descendantTraversalLogic, {
                ...options,
                isRoot: false
              })
            )) {
            return possibleResultNode;
          }
        }
        // go one-level up
        if (getDisplayType(parentNode) === 'block') {
          return null;
        }
        if (!lodash.isNil(
            possibleResultNode = getPreviousOrNextTextNode(parentNode, position, {
              ...options,
              isRoot: false
            })
          )) {
          return possibleResultNode;
        }
        return null;
      }

      switch (position) {
        case 'p': {
          return _getPreviousOrNextTextNode('previousSibling', 'l');
        }
        case 'n': {
          return _getPreviousOrNextTextNode('nextSibling', 'f');
        }
      }
      return null;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  const lodash = new MyLodash()
  let options = {
    excludeEmptyNodes: true,
    isRoot: true
  }

  let sel = window.getSelection();
  console.log(
    getPreviousOrNextTextNode(sel.anchorNode, 'p', {...options, upperLimitNode: sel.anchorNode})
  )
})()
