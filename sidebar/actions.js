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
  console.log(fileButton.files)
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
