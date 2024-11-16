async function sendMessageToContentScript(name, params=null) {
  try {
    await browser.tabs.executeScript({file: '/core/sidebar-message-listener.js'});
    const tabs = await browser.tabs.query({currentWindow: true, active: true});
    console.log(tabs[0])
    await browser.tabs.sendMessage(tabs[0].id, {name, params});
  } catch(err) {
    console.log(err)
  }
}

const toggleButton = document.getElementById('toggle')
const toggleStates = ["Turn On", "Turn Off"]

toggleButton.addEventListener('click', async() => {
  toggleButton.innerText = 
    toggleButton.innerText == toggleStates[0]? toggleStates[1]: toggleStates[0]
  await sendMessageToContentScript('toggle') 
})

const saveButton = document.getElementById('save')

saveButton.addEventListener('click', async() => {
  await sendMessageToContentScript('save') 
})

const fileButton = document.getElementById('file')

fileButton.addEventListener('change', async() => {
  await sendMessageToContentScript('restore', {files: fileButton.files}) 
})

// The content script sends a message to retrieve the state of the highlight-enabled flag
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse(toggleButton.innerText)
});

// TODO: Find out why the following errors occurred
// - Missing host permissions for tab
// - _ is not defined
// browser.tabs.onUpdated.addListener(() => {
//   console.log("Tabs updated")
//   toggleButton.innerText = "Turn Off"
//   // toggleButton.click()
//   browser.tabs.executeScript({
//     file: "/core/sidebar-message-listener.js"
//     }).then(() => {
//       listener({
//         name: "toggle"
//       })
//     })
//       .catch((err) => console.log(err));
// }, {
//   properties: ['url', 'status', 'title']
// })

