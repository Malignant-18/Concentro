import { Link } from '../../popup.js';

export function Pomodoro() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Pomodoro Technique';
    
    const description = document.createElement('p');
    description.className = 'mt-3';
    description.textContent = 'The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.';
    
    const startButton = document.createElement('button');
    startButton.className = 'mt-5 px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition';
    startButton.textContent = 'Start';
    
    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(startButton);
    container.appendChild(Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition'));
    
    return container;
} 