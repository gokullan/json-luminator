(function () {
if (window.hasRun) {
    return;
  }
  window.hasRun = true;

function saveHighlights() {
  try {
    objToSave = { "highlights": [] }
    let rootNode = document.querySelector('body')
    storeAll(rootNode, objToSave);
    download(objToSave, 'highlight-1.json')
  } catch(err) {
    console.log(err);
  }
}

function base64ToJson(base64String) {
  const prefix = 'data:application/json;base64,';
  const decodedString = atob(
    base64String.slice(prefix.length)
  );
  return JSON.parse(decodedString);
}

function getFile(message) {
  const file = _.get(message, 'params.0')
  const reader = new FileReader();
    reader.onload = (e) => {
      console.log(reader.result)
      highlights = base64ToJson(reader.result)
      restoreHighlights(highlights)
    };
  console.log(file)
  reader.readAsDataURL(file);
}

function consumeMessage(request, sender, sendResponse) {
  try {
    console.log(request)
    const command = _.get(request, 'name')
    if (command === 'save') {
      saveHighlights()
    }
    else if (command === 'restore') {
        // objToSave = savedHighlights;
        // restoreHighlights(objToSave);
      getFile(request)
    }
  } catch(err) {
    console.log(err);
  }
}
browser.runtime.onMessage.addListener(consumeMessage);
}())
