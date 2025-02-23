import { Link } from '../../popup.js'; // Adjust the path as necessary

export function Pomodoro() {
    const container = document.createElement('div');
    container.className = 'pomodoro-container';

    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Pomodoro Timer';

    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display text-2xl font-bold mt-4';
    timerDisplay.textContent = '00:20';

    const statusText = document.createElement('p');
    statusText.className = 'status-text text-sm mt-2 text-gray-600';
    statusText.textContent = 'Timer not started';

    const notificationBox = document.createElement('div');
    notificationBox.className = 'notification-box hidden'; // Initially hidden
    notificationBox.style.position = 'fixed';
    notificationBox.style.top = '10px';
    notificationBox.style.right = '10px';
    notificationBox.style.padding = '10px';
    notificationBox.style.zIndex = '10'; // Set z-index to 10
    notificationBox.style.borderRadius = '5px';
    notificationBox.style.color = 'white';
    notificationBox.style.fontSize = '16px';
    notificationBox.style.backgroundColor = 'green'; // Green for notifications

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container flex gap-2 mt-5';

    const startButton = document.createElement('button');
    startButton.className = 'button button-yellow';
    startButton.textContent = 'Start Timer';

    const stopButton = document.createElement('button');
    stopButton.className = 'button button-gray';
    stopButton.textContent = 'Stop Timer';

    let isBreak = false;
    let timeLeft = 20;

    // Load initial state
    chrome.storage.local.get(['isBreak', 'timeLeft', 'isRunning'], (result) => {
        if (result.isRunning) {
            isBreak = result.isBreak || false;
            timeLeft = result.timeLeft || 20;
            updateTimerDisplay();
            updateStatus(isBreak ? 'Break time!' : 'Timer running');
        }
    });

    // Listen for timer updates from background
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'timerUpdate') {
            timeLeft = message.timeLeft;
            isBreak = message.isBreak;
            updateTimerDisplay();
            updateStatus(isBreak ? 'Break time!' : 'Timer running');

            // Show break message when break starts
            if (isBreak && timeLeft === 10) {
                showNotification('Break time! Enjoy your rest!');
            }

            // Hide break message when break ends
            if (!isBreak && timeLeft === 20) {
                showNotification('Break time Over!');
            }
        }
    });

    function startTimer() {
        timeLeft = 20;
        isBreak = false;
        updateTimerDisplay();
        updateStatus('Timer running');

        // Save state and start background timer
        chrome.storage.local.set({
            isRunning: true,
            isBreak: false,
            timeLeft: 20
        });

        // Start the background timer
        chrome.runtime.sendMessage({ 
            type: 'startTimer',
            timeLeft: 20,
            isBreak: false
        });
    }

    function stopTimer() {
        // Stop the background timer
        chrome.runtime.sendMessage({ type: 'stopTimer' });
        chrome.storage.local.set({ isRunning: false });
        
        updateStatus('Timer stopped');
        timeLeft = 20;
        isBreak = false;
        updateTimerDisplay();
        hideNotification(); // Hide notification if stopped
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateStatus(status) {
        statusText.textContent = status;
        statusText.className = `status-text text-sm mt-2 ${
            status.includes('running') ? 'text-green-600' :
            status.includes('Break') ? 'text-blue-600' : 'text-gray-600'
        }`;
    }

    function showNotification(message) {
        notificationBox.textContent = message;
        notificationBox.classList.remove('hidden'); // Show the notification
        document.body.appendChild(notificationBox);

        // Automatically hide the notification after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }

    function hideNotification() {
        notificationBox.classList.add('hidden'); // Hide the notification
        if (notificationBox.parentNode) {
            notificationBox.parentNode.removeChild(notificationBox); // Remove from DOM
        }
    }

    // Append buttons to button container
    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(stopButton);

    // Append all elements to the container
    container.appendChild(title);
    container.appendChild(timerDisplay);
    container.appendChild(statusText);
    container.appendChild(buttonContainer);
    container.appendChild(notificationBox); // Append notification box to the container
    const backButton = Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition button-right');
    container.appendChild(backButton);

    // Event listeners for buttons
    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopTimer);

    // Ensure the container is appended to the DOM
    document.body.appendChild(container); // Example of appending to the body

    return container;
}