class StoreRestoreClass {
  constructor() {}

  saveHighlights(params={}) {
    try {
      let objToSave = { "highlights": [] }
      let rootNode = document.querySelector('body')
      this.storeAll(rootNode, objToSave);
      Helper.download(objToSave, `${document.title}-highlights.json`);
    } catch(err) {
      console.log(err);
    }
  }
  
  getFile(params) {
    const file = _.get(params, 'files.0')
    const reader = new FileReader();
      reader.onload = (e) => {
        console.log(reader.result)
        let highlights = Helper.base64ToJson(reader.result)
        this.restoreHighlights(highlights)
      };
    console.log(file)
    reader.readAsDataURL(file);
  }
  
  storeAll(rootNode, objToSave, path=[]) {
    const children = _.get(rootNode, 'childNodes');
    try {
      if (!_.isEmpty(children) && !_.isNil(children)) {
        // iterate DOM
        for (let i = 0; i < children.length; ++i) {
          let currentNode = children[i];
          // TODO: Add more validations and refactor
          if (_.get(currentNode, 'nodeName') === "MARK") {
            const properties = this.fetchPropertiesFromClassNames(currentNode)
            if (properties.isAnchorNode) {
              // TODO: Are we sure `currentNode.childNodes[0]` exists?
              const { focusNode, focusOffset, n } = this.getHighlightEndNode(currentNode.childNodes[0])
              const childIndex = properties.anchorOffset > 0? i - 1: i; 
              _.get(objToSave, 'highlights').push({
                "path": _.concat(path, childIndex),
                "anchorOffset": properties.anchorOffset,
                "focusOffset": focusOffset,
                "n": n
              })
            }
          }
          this.storeAll(
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
  
  fetchPropertiesFromClassNames(markNode) {
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
  getHighlightEndNode(textNode) {
    const options = {excludeEmptyNodes: true, isRoot: true, upperLimitNode: document.querySelector('body')}
    let focusNode = null, focusOffset = null, n = 0
    // assumes that the textNode has markNode as parent
    let properties = this.fetchPropertiesFromClassNames(textNode.parentNode)
    console.log(properties)
    // TODO: Refactor
    while (n < 10 && textNode && !properties.isFocusNode) {
      textNode = Helper.getPreviousOrNextTextNode(textNode, 'n', options)
      console.log("Next text node")
      console.log(textNode)
      properties = this.fetchPropertiesFromClassNames(textNode.parentNode)
      n += 1
    }
    // log errors for other cases
    if (properties.isFocusNode) {
      focusNode = textNode 
      focusOffset = properties.focusOffset
    }
    return { focusNode, focusOffset, n }
  }
  
  restoreHighlights(savedObj) {
    try {
      const savedHighlights = _.get(savedObj, 'highlights', []);
      _.forEach(savedHighlights, (highlight) => {
        try {
          let { path, anchorOffset, focusOffset, n } = highlight;
          console.log(path);
          let node = document.querySelector('body')
          _.forEach(path, (childIndex) => {
            node = node.childNodes[childIndex]
          })
          console.log("Node")
          console.log(node)
          let anchorNode = node
          let focusNode = Helper.traverseForNNodesAndReturn(node, n)
          HighlightDehiglight.traverseAndHighlight({
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
}
