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

  // Get stored whitelist and blacklist
  const { whitelist = [] } = await chrome.storage.local.get(['whitelist']);
  const { blacklist = [] } = await chrome.storage.local.get(['blacklist']);

  console.log("Retrieved whitelist:", whitelist);
  console.log("Retrieved blacklist:", blacklist);

  // Check if the URL is in the whitelist
  if (whitelist.some(pattern => url.includes(pattern))) {
    console.log(`URL is whitelisted: ${url}. No redirection will occur.`);
    return; // Exit the function if the URL is whitelisted
  }

  const payload = {
    url: url,
    task: currentGoal,
    whitelist: whitelist,  // Use the retrieved whitelist
    blacklist: blacklist   // Use the retrieved blacklist
  };

  console.log(`Sending URL to backend: ${url}`);
  console.log("Payload:", payload);  // Log the payload to verify the values

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
  console.log("tracking variable" ,isTracking)
  currentGoal = "";
  console.log("previos relavant url : ",lastRelevantUrl);
  lastRelevantUrl = "";
  console.log("URL noww ",lastRelevantUrl);

  console.log("Tracking stopped. No more URL monitoring.");

  // Store tracking state
  updateTrackingState(false);

  // Remove event listeners to prevent further tracking
  chrome.tabs.onUpdated.removeListener(handleURLChange);
  chrome.tabs.onCreated.removeListener(handleTabCreated);
  chrome.tabs.onActivated.removeListener(handleTabActivated);

  // Close any open ports to stop communication
  if (connectedPort) {
    connectedPort.disconnect();
    connectedPort = null;
  }

  // Send response confirming tracking has stopped
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
  }
});






















    

// background.js (Background Script - Listeners & Timer Logic)
let isRunning = false;
let timeLeft = 30;
let isBreak = false;
let mode = '';

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'startTimer') {
        mode = message.mode;
        startPomodoro();
    }
});

function startPomodoro() {
    isRunning = true;
    timeLeft = 30;
    isBreak = false;
    updateTimer();
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        chrome.runtime.sendMessage({ type: 'timerUpdate', timeLeft, isBreak });
        setTimeout(updateTimer, 1000);
    } else if (!isBreak) {
        isBreak = true;
        timeLeft = 30;
        chrome.runtime.sendMessage({ type: 'sessionEnd' });
        if (mode === 'tabtrack') {
            chrome.runtime.sendMessage({ type: 'stopTracking' });
        }
        setTimeout(updateTimer, 1000);
    } else {
        isBreak = false;
        timeLeft = 30;
        if (mode === 'tabtrack') {
            chrome.runtime.sendMessage({ type: 'startTracking' });
        }
        updateTimer();
    }
}
