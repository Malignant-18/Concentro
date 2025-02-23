let isTrackingActive = false;
let currentTrackingGoal = "";

function checkTrackingState() {
  chrome.runtime.sendMessage({ type: "getTrackingState" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    
    if (response && response.isTracking) {
      isTrackingActive = true;
      currentTrackingGoal = response.goal;
      createOrUpdateDot();
    } else {
      isTrackingActive = false;
      currentTrackingGoal = "";
      removeDot();
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "displayTrackingResult") {
      console.log("Received tracking results:", message.data);
      if (message.success) {
        injectGlowingDot();
      }
    } else if (message.type === "stopTracking") {
      // Remove tracking indicators
      const dot = document.querySelector('.tracking-dot');
      if (dot) dot.remove();
    }
  });

function createOrUpdateDot() {
  let dot = document.getElementById('tracking-dot');
  
  if (!dot) {
    if (!document.getElementById('tracking-dot-styles')) {
      const styles = `
        #tracking-dot {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 12px;
          height: 12px;
          background-color: #00ff00;
          border-radius: 50%;
          z-index: 2147483647;
          pointer-events: none;
          box-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
          animation: dotPulse 2s infinite;
          transition: all 0.3s ease;
        }

        @keyframes dotPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;

      const styleElement = document.createElement('style');
      styleElement.id = 'tracking-dot-styles';
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }

    dot = document.createElement('div');
    dot.id = 'tracking-dot';
    document.body.appendChild(dot);
  }

  return dot;
}

document.addEventListener('DOMContentLoaded', checkTrackingState);

setInterval(checkTrackingState, 5000);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    checkTrackingState();
  }
});

  
  const observer = new MutationObserver((mutations) => {
    chrome.runtime.sendMessage({ type: "getTrackingState" }, (response) => {
      if (response && response.isTracking && !document.getElementById('tracking-dot')) {
        createOrUpdateDot();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

function showNotification(message, isRelevant) {
  const notificationBox = document.createElement('div');
  notificationBox.style.position = 'fixed';
  notificationBox.style.top = '10px';
  notificationBox.style.right = '10px';
  notificationBox.style.padding = '10px';
  notificationBox.style.zIndex = '9999';
  notificationBox.style.borderRadius = '5px';
  notificationBox.style.color = 'white';
  notificationBox.style.fontSize = '16px';
  notificationBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  
  if (isRelevant) {
    notificationBox.style.backgroundColor = 'green'; 
  } else {
    notificationBox.style.backgroundColor = 'red';
  }

  notificationBox.innerText = message;

  document.body.appendChild(notificationBox);

  setTimeout(() => {
    notificationBox.remove();
  }, 5000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "displayTrackingResult") {
    showNotification(message.data.is_relevant ? "Website matches task!" : "Website doesn't match task!", message.data.is_relevant);
  }
});