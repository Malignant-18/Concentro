import { Link } from '../../popup.js';

export function TabTrack() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Enter a Task';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'mt-5 w-full h-32 p-2 border border-gray-400 rounded';
    textarea.placeholder = 'Enter your task here...';
    
    const submitButton = document.createElement('button');
    submitButton.className = 'mt-5 px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition';
    submitButton.textContent = 'Submit';
    
    container.appendChild(title);
    container.appendChild(textarea);
    container.appendChild(submitButton);
    container.appendChild(Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition'));
    
    return container;
} 