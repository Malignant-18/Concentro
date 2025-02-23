import { Link } from '../../popup.js';

export function Welcome() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const titleContainer = document.createElement('h1');
    titleContainer.className = 'welcome-title';
    titleContainer.textContent = 'Welcome to ';

    const concentroText = document.createElement('span');
    concentroText.className = 'concentro-title';
    concentroText.textContent = 'Concentro';

    titleContainer.appendChild(concentroText);

    const startButton = Link('/main', "Let's Start", 'mt-5 px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition');
    
    const productivityImage = document.createElement('img');
    productivityImage.src = 'assets/productivity.png';
    productivityImage.alt = 'Productivity Image';
    productivityImage.className = 'productivity-image';

    container.appendChild(titleContainer);
    container.appendChild(startButton);
    container.appendChild(productivityImage);
    
    return container;
} 