import { Link } from '../../popup.js';

export function Whitelist() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Whitelist';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mt-5 w-full p-2 border border-gray-400 rounded';
    input.placeholder = 'Enter website URL';
    
    const addButton = document.createElement('button');
    addButton.className = 'mt-5 px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition';
    addButton.textContent = '+';
    
    container.appendChild(title);
    container.appendChild(input);
    container.appendChild(addButton);
    container.appendChild(Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition'));
    
    return container;
} 