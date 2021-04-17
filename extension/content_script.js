chrome.runtime.onMessage.addListener((event) => {
  if (event.type === "REQUEST_OVERWRITTEN_FUNCTIONS") {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    document.head.appendChild(script);
    const listener = (event) => {
      const { data } = event;
      if (data && data.type === "RESPONSE_OVERWRITTEN_FUNCTIONS") {
        chrome.runtime.sendMessage(data);
        window.removeEventListener("message", listener);
      }
    };
    window.addEventListener("message", listener);
  }
});
