import { Link } from '../../popup.js';

export function Pomodoro() {
    const container = document.createElement('div');
    container.className = 'pomodoro-container mt-5 flex flex-col items-start';

    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Pomodoro Timer';

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
        chrome.runtime.sendMessage({ type: 'startTimer', mode: 'tabtrack' });
        window.location.hash = '/tab-track';
    });

    const lenientButton = document.createElement('button');
    lenientButton.className = 'button button-gray mt-2';
    lenientButton.textContent = 'Lenient Mode';
    lenientButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'startTimer', mode: 'lenient' });
    });

    let isBreak = false;
    let timeLeft = 30;

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'timerUpdate') {
            timeLeft = message.timeLeft;
            isBreak = message.isBreak;
            updateTimerDisplay();
            updateStatus(isBreak ? 'Break time!' : 'Timer running');
        } else if (message.type === 'sessionEnd') {
            showNotification('Time is done! You can rest for 30 seconds.');
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
    container.appendChild(timerDisplay);
    container.appendChild(statusText);
    container.appendChild(tabTrackButton);
    container.appendChild(lenientButton);
    
    const backButton = Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition button-right');
    container.appendChild(backButton);

    return container;
}
