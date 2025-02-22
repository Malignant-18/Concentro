import { Link } from '../../popup.js';

export function Welcome() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Welcome to Productivity Extension';
    
    const startButton = Link('/main', 'Start', 'mt-5 px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition');
    
    container.appendChild(title);
    container.appendChild(startButton);
    
    return container;
} 