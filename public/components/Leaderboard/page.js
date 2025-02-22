import { Link } from '../../popup.js';

export function Leaderboard() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Leaderboard';
    
    const list = document.createElement('ul');
    list.className = 'mt-3';
    list.innerHTML = `
        <li>John Doe - 120 minutes</li>
        <li>Jane Smith - 90 minutes</li>
        <li>Bob Johnson - 60 minutes</li>
    `;
    
    container.appendChild(title);
    container.appendChild(list);
    container.appendChild(Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition'));
    
    return container;
} 