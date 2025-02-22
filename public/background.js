chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTracking") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0) {
              sendResponse({ success: false, error: "No active tab found" });
              return;
          }
          
          const currentTabUrl = tabs[0].url; 
          const payload = {
              url: currentTabUrl,
              task: message.goal,
              whitelist: ["python.org", "docs.python.org"],
              blacklist: ["facebook.com", "twitter.com"]
          };

          fetch("http://localhost:8000/analyze", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
          })
          .then(response => response.json())
          .then(data => {
              console.log("Tracking response:", data);
              sendResponse({ success: true, goal: message.goal });
          })
          .catch(error => {
              console.error("Error tracking task:", error);
              sendResponse({ success: false, error: error.message });
          });

          return true;  // This keeps the response channel open for async fetch
      });

      return true;  // Keeps `sendResponse()` valid
  }
});