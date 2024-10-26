# JSON-Luminator

An open-source web-highlighter with the ability to save and restore highlights with `json` files. Intended to be used as a Firefox Add-on.


https://github.com/user-attachments/assets/5dc8bbff-25fc-4ad2-b75d-63cbf2c9caf5



## Features
The following is a list of features *currently* supported by this Addon.
- Highlight on selection of text
- Remove highlight on selection of an already highlighted text
- Save highlights made on a webpage to a `json` file
- Restore highlights from the (aforementioned) `json` file on start of a new session

## Motivation
- To provide to users the satisfaction of highlighting on webpages
- To ensure a fail-safe mechanism to persist highlights without having to rely on browser cookies

## Running the extension locally
- `git clone https://github.com/gokullan/json-luminator.git`
- Enter `about:debugging`in the (Firefox) browser address bar and click on the `This Firefox` option
- Click on `"Load Temporary Add-on"` and choose the folder where the git-repository was cloned
- To view the extension sidebar, go to the browser menu and choose `View` &rarr; `Sidebars` &rarr; `JSON-Luminator`
