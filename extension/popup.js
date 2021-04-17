window.addEventListener("load", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "REQUEST_OVERWRITTEN_FUNCTIONS",
    });
  });

  chrome.runtime.onMessage.addListener((event) => {
    if (event.type === "RESPONSE_OVERWRITTEN_FUNCTIONS") {
      const overwrittens = event.payload.map((funcName) => {
        const li = document.createElement("li");
        li.textContent = funcName;
        return li;
      });
      const list = document.querySelector("#list");
      overwrittens.forEach((li) => {
        list.appendChild(li);
      });
    }
  });
});
