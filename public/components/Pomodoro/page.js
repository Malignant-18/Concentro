import { Link } from '../../popup.js';

export function Pomodoro() {
    const container = document.createElement('div');
    container.className = 'pomodoro-container mt-5 flex flex-col items-start';

    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Pomodoro Timer';

    const text = document.createElement('h4');
    text.className = 'h4';
    text.textContent = 'The Pomodoro Technique uses 25-minute work sessions followed by short breaks to enhance productivity.';

    const timerDisplay = document.createElement('div');
    timerDisplay.className = 'timer-display text-2xl font-bold mt-4';
    timerDisplay.textContent = '00:30';

    const statusText = document.createElement('p');
    statusText.className = 'status-text text-sm mt-2 text-gray-600';
    statusText.textContent = 'Timer not started';

    const tabTrackButton = document.createElement('button');
    tabTrackButton.className = 'button button-yellow mt-5';
    tabTrackButton.textContent = 'Enable TabTrack';
    tabTrackButton.addEventListener('click', () => {
        console.log('tabTrackButton clicked');
        chrome.runtime.sendMessage({ type: 'startTimer', mode: 'tabtrack' });
        window.location.hash = '/tab-track';
    });

    const lenientButton = document.createElement('button');
    lenientButton.className = 'button button-gray mt-2';
    lenientButton.textContent = 'Lenient Mode';
    lenientButton.addEventListener('click', () => {
        console.log('lenientButton clicked');
        chrome.runtime.sendMessage({ type: 'startTimer', mode: 'lenient' });
    });

    let isBreak = false;
    let timeLeft = 30;

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'timerUpdate') {
            console.log('timerUpdate message received');
            timeLeft = message.timeLeft;
            isBreak = message.isBreak;
            console.log('timeLeft:', timeLeft);
            console.log('isBreak:', isBreak);
            updateTimerDisplay();
            updateStatus(isBreak ? 'Break time!' : 'Timer running');
        } else if (message.type === 'sessionEnd') {
            console.log('sessionEnd message received');
            showNotification('Time is done! You can rest for 30 seconds.');
            
        }
    });

    
    const stopButton = document.createElement('button');
    stopButton.className = 'button button-red mt-5';
    stopButton.textContent = 'Stop Timer';
    // Add event listener for the stop button
    stopButton.addEventListener('click', async () => {
        try {
            // Stop the timer
            chrome.runtime.sendMessage({ type: "stopTimer" }, (response) => {
                if (response && response.success) {
                    console.log("Timer stopped successfully");
                }
            });

            // Stop the tracking
            chrome.runtime.sendMessage({ type: "stopTracking" }, (response) => {
                if (response && response.success) {

                    console.log("Tracking stopped successfully");
                    
                }
            });

            // Clear local storage
            await chrome.storage.local.remove(['currentGoal', 'isTrackingEnabled']);
            
            alert("Timer and tracking stopped successfully!");
            window.location.reload(); // Refresh the Pomodoro page
        } catch (error) {
            console.error("Error stopping timer and tracking:", error);
            alert("Failed to stop timer and tracking. Please try again.");
        }
    });

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateStatus(status) {
        statusText.textContent = status;
    }
    
    function showNotification(message) {
        alert(message);
    }
    
    container.appendChild(title);
    container.appendChild(text);
    container.appendChild(timerDisplay);
    container.appendChild(statusText);
    container.appendChild(tabTrackButton);
    container.appendChild(lenientButton);
    container.appendChild(stopButton);
    
    const backButton = Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition button-right');
    container.appendChild(backButton);

    return container;
}
