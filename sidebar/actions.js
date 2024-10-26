// async function listener(command) {
// 
//   await browser.tabs.executeScript({file: 'core/sidebar-message-listener.js'});
//   const tabs = await browser.tabs.query({currentWindow: true, active: true});
//   browser.tabs.sendMessage(tabs[0].id, {command: command});
// };

function listener(message) {
   const gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
   gettingActiveTab.then((tabs) => {
     browser.tabs.sendMessage(tabs[0].id, message);
   });
}

const toggleButton = document.getElementById('toggle')
const toggleStates = ["Turn On", "Turn Off"]

toggleButton.addEventListener('click', () => {
  toggleButton.innerText = 
    toggleButton.innerText == toggleStates[0]? toggleStates[1]: toggleStates[0]
  browser.tabs.executeScript({
    file: "/core/sidebar-message-listener.js"
    }).then(() => {
      listener({
        name: "toggle"
      })
    })
      .catch((err) => console.log(err));
})

browser.tabs.onUpdated.addListener(() => {
  toggleButton.innerText = "Turn Off"
  toggleButton.click()
}, {
  properties: ['url', 'status', 'title']
})

const saveButton = document.getElementById('save')

saveButton.addEventListener('click', () => {
  browser.tabs.executeScript({
    file: "/core/sidebar-message-listener.js"
    }).then(() => {
      listener({
        name: "save"
      })
    })
      .catch((err) => console.log(err));
})

const fileButton = document.getElementById('file')

fileButton.addEventListener('change', () => {
  browser.tabs.executeScript({
    file: "/core/sidebar-message-listener.js"
    }).then(() => {
      listener({
        name: "restore",
        params: fileButton.files 
      })
    })
      .catch((err) => console.log(err));
})
