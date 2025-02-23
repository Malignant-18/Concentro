let isTracking = false;
let currentGoal = "";
let lastRelevantUrl = ""; // Variable to store the last relevant URL
let isTrackingEnabled = true;
let connectedPort; // Store the connected port for the popup
let timer;

// Middleware to check if a tracking session is active
function isTrackingSessionActive() {
  return isTracking === true;
}

// Store tracking state
async function updateTrackingState(isTracking, goal = "") {
  await chrome.storage.local.set({ 
    isTracking, 
    goal
  });
}

// Analyze URL against current goal
async function analyzeUrl(tabId, url) {
  if (!isTrackingEnabled || !url || url.startsWith('chrome://')) return;

  const payload = {
    url: url,
    task: currentGoal,
    whitelist: ["python.org", "docs.python.org"],
    blacklist: ["facebook.com", "twitter.com"]
  };

  console.log(`Sending URL to backend: ${url}`);

  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("Tracking response:", data);

    // Check if the response indicates relevance
    if (data.is_relevant) {
      lastRelevantUrl = url; // Update last relevant URL
      console.log(`Updated last relevant URL: ${lastRelevantUrl}`);
    } else {
      console.log("Content is not relevant. Redirecting to the last relevant URL:", lastRelevantUrl);
      if (lastRelevantUrl) {
        // Redirect to the last relevant URL
        chrome.tabs.update(tabId, { url: lastRelevantUrl });
      } else {
        console.log("No last relevant URL to redirect to.");
      }
    }

    // Send tracking results to the tab
    chrome.tabs.sendMessage(tabId, {
      type: "displayTrackingResult",
      success: true,
      goal: currentGoal,
      data
    });
  } catch (error) {
    console.error("Error tracking URL:", error);
  }
}

// Handle URL changes in the current tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process if we're tracking and the URL has completed loading
  if (isTracking && changeInfo.status === 'complete' && tab.url) {
    await analyzeUrl(tabId, tab.url);
  }
});

function handleStartTracking(message, sender, sendResponse) {
  isTracking = true;
  currentGoal = message.goal;
  
  console.log("Tracking started. Monitoring URL changes...");

  // Immediately analyze the current URL of the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      analyzeUrl(activeTab.id, activeTab.url); // Analyze the current URL immediately
    }
  });

  // Store tracking state
  updateTrackingState(true, message.goal);
  
  // Send success response
  sendResponse({ success: true, goal: message.goal });
}

function handleStopTracking(message, sender, sendResponse) {
  isTracking = false;
  currentGoal = "";
  lastRelevantUrl = ""; // Reset the last relevant URL
  
  // Store tracking state
  updateTrackingState(false);
  
  // Send success response
  sendResponse({ success: true });
}

// Update tab tracking when URL changes
function handleURLChange(tabId, changeInfo, tab) {
  if (isTrackingSessionActive() && changeInfo.url) {
    console.log(`URL changed in tab ${tabId}: ${changeInfo.url}`);
    analyzeUrl(tabId, changeInfo.url);
  }
}

// Handle new tab creation
function handleTabCreated(tab) {
  if (isTrackingSessionActive()) {
    console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
    if (tab.url && !tab.url.startsWith('chrome://')) {
      analyzeUrl(tab.id, tab.url);
    }
  }
}

// Handle tab activation
function handleTabActivated(activeInfo) {
  if (isTrackingSessionActive()) {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log(`Switched to tab: TabId = ${activeInfo.tabId}, URL = ${tab.url}`);
      if (tab.url && !tab.url.startsWith('chrome://')) {
        analyzeUrl(tab.id, tab.url);
      }
    });
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "startTracking") {
    console.log("Received task:", message.goal);
    console.log("Received whitelist:", message.whitelist);
    console.log("Received blacklist:", message.blacklist);
    
    handleStartTracking(message, sender, sendResponse);
    return true;
  } else if (message.type === "stopTracking") {
    handleStopTracking(message, sender, sendResponse);
    return true;
  } else if (message.type === "enableTracking") {
    isTrackingEnabled = message.enabled;
    console.log("Tracking enabled:", isTrackingEnabled);
  } else if (message.type === 'startTimer') {
    // Clear any existing timer
    if (timer) {
      clearInterval(timer);
    }

    let timeLeft = message.timeLeft || 20;
    let isBreak = message.isBreak || false;

    // Start the timer
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        
        // Save state
        chrome.storage.local.set({ timeLeft, isBreak });
        
        // Update popup if open
        chrome.runtime.sendMessage({
          type: 'timerUpdate',
          timeLeft,
          isBreak
        }).catch(() => {}); // Ignore errors if popup is closed
      } else {
        // Timer finished
        if (isBreak) {
          // Break finished, start work period
          timeLeft = 20;
          isBreak = false;
          showNotification('Break is over! Back to work!');
        } else {
          // Work period finished, start break
          timeLeft = 10;
          isBreak = true;
          showNotification('Time for a break!');
        }

        // Save new state
        chrome.storage.local.set({ timeLeft, isBreak });
        
        // Update popup if open
        chrome.runtime.sendMessage({
          type: 'timerUpdate',
          timeLeft,
          isBreak
        }).catch(() => {}); // Ignore errors if popup is closed
      }
    }, 1000);
  } else if (message.type === 'stopTimer') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
});

// Function to show notifications
function showNotification(message) {
    chrome.notifications.create({
        type: 'basic', // Required
        title: 'Pomodoro Timer', // Required
        message: message // Required
    }, (notificationId) => {
        if (chrome.runtime.lastError) {
            console.error("Error creating notification:", chrome.runtime.lastError);
        } else {
            console.log("Notification created with ID:", notificationId);
        }
    });
}

// Ensure timer keeps running when extension reloads
chrome.storage.local.get(['isRunning', 'timeLeft', 'isBreak'], (result) => {
  if (result.isRunning) {
    chrome.runtime.sendMessage({ 
      type: 'startTimer',
      timeLeft: result.timeLeft || 20,
      isBreak: result.isBreak || false
    });
  }
});

chrome.tabs.onUpdated.addListener(handleURLChange);
chrome.tabs.onCreated.addListener(handleTabCreated);
chrome.tabs.onActivated.addListener(handleTabActivated);

chrome.runtime.onConnect.addListener((port) => {
    connectedPort = port;
    port.onDisconnect.addListener(() => {
        connectedPort = null;
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'timerAlarm') {
        chrome.storage.local.get(['isBreak', 'timeLeft', 'isRunning'], (result) => {
            if (!result.isRunning) return; // Don't update if timer is stopped

            let timeLeft = result.timeLeft || 20; // Default to 20 seconds
            let isBreak = result.isBreak || false;

            if (timeLeft > 0) {
                timeLeft--; // Decrement the timer
                chrome.storage.local.set({ timeLeft }); // Save the updated time

                // Send a message to the popup to update the display if connected
                if (connectedPort) {
                    connectedPort.postMessage({ type: 'updateTimer', timeLeft });
                }
            } else {
                // Timer has reached zero, handle end of timer
                if (isBreak) {
                    // Handle end of break
                    chrome.storage.local.set({ isBreak: false, timeLeft: 20 }); // Reset for work
                    if (connectedPort) {
                        connectedPort.postMessage({ type: 'updateTimer', timeLeft: 20, isBreak: false });
                    }
                } else {
                    // Handle end of work session
                    chrome.storage.local.set({ isBreak: true, timeLeft: 10 }); // Set for break
                    if (connectedPort) {
                        connectedPort.postMessage({ type: 'updateTimer', timeLeft: 10, isBreak: true });
                    }
                }
            }
        });
    }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'startTimer') {
        chrome.alarms.create('timerAlarm', { periodInMinutes: 1 / 60 }); // 1 second
    } else if (message.type === 'stopTimer') {
        chrome.alarms.clear('timerAlarm');
        chrome.storage.local.set({ isRunning: false });
    }
});