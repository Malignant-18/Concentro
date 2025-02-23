let isTracking = false;
let currentGoal = "";
let lastRelevantUrl = ""; 
let isTrackingEnabled = true;
let connectedPort; 
let timer;

function isTrackingSessionActive() {
  return isTracking === true;
}

async function updateTrackingState(isTracking, goal = "") {
  await chrome.storage.local.set({ 
    isTracking, 
    goal
  });
}

async function analyzeUrl(tabId, url) {
  if (!isTrackingEnabled || !url || url.startsWith('chrome://')) return;

  const { whitelist = [] } = await chrome.storage.local.get(['whitelist']);
  const { blacklist = [] } = await chrome.storage.local.get(['blacklist']);

  console.log("Retrieved whitelist:", whitelist);
  console.log("Retrieved blacklist:", blacklist);

  if (whitelist.some(pattern => url.includes(pattern))) {
    console.log(`URL is whitelisted: ${url}. No redirection will occur.`);
    return; 
    }

  const payload = {
    url: url,
    task: currentGoal,
    whitelist: whitelist,  
    blacklist: blacklist   
  };

  console.log(`Sending URL to backend: ${url}`);
  console.log("Payload:", payload);  

  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    console.log("Tracking response:", data);

    if (data.is_relevant) {
      lastRelevantUrl = url;
      console.log(`Updated last relevant URL: ${lastRelevantUrl}`);
    } else {
      console.log("Content is not relevant. Redirecting to the last relevant URL:", lastRelevantUrl);
      if (lastRelevantUrl) {
        chrome.tabs.update(tabId, { url: lastRelevantUrl });
      } else {
        console.log("No last relevant URL to redirect to.");
      }
    }

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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (isTracking && changeInfo.status === 'complete' && tab.url) {
    await analyzeUrl(tabId, tab.url);
  }
});

function handleStartTracking(message, sender, sendResponse) {
  isTracking = true;
  currentGoal = message.goal;
  
  console.log("Tracking started. Monitoring URL changes...");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      analyzeUrl(activeTab.id, activeTab.url); 
    }
  });

  updateTrackingState(true, message.goal);
  
  sendResponse({ success: true, goal: message.goal });
}

function handleStopTracking(message, sender, sendResponse) {
  isTracking = false;
  console.log("tracking variable" ,isTracking)
  currentGoal = "";
  console.log("previos relavant url : ",lastRelevantUrl);
  lastRelevantUrl = "";
  console.log("URL noww ",lastRelevantUrl);

  console.log("Tracking stopped. No more URL monitoring.");

  updateTrackingState(false);

  chrome.tabs.onUpdated.removeListener(handleURLChange);
  chrome.tabs.onCreated.removeListener(handleTabCreated);
  chrome.tabs.onActivated.removeListener(handleTabActivated);

  if (connectedPort) {
    connectedPort.disconnect();
    connectedPort = null;
  }

  sendResponse({ success: true });
}




function handleURLChange(tabId, changeInfo, tab) {
  if (isTrackingSessionActive() && changeInfo.url) {
    console.log(`URL changed in tab ${tabId}: ${changeInfo.url}`);
    analyzeUrl(tabId, changeInfo.url);
  }
}

function handleTabCreated(tab) {
  if (isTrackingSessionActive()) {
    console.log(`New tab opened: ${tab.id}, URL = ${tab.url || "about:blank"}`);
    if (tab.url && !tab.url.startsWith('chrome://')) {
      analyzeUrl(tab.id, tab.url);
    }
  }
}

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