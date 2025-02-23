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
  }
});

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
