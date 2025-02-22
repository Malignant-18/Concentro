import { Link } from '../../popup.js';

export function Main() {
    const container = document.createElement('div');
    container.className = 'p-5 bg-white min-h-screen';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold text-center';
    title.textContent = 'Hello... What do you want to do?';
    
    const underline = document.createElement('hr');
    underline.className = 'my-4 border-gray-300';
    
    const taskSection = document.createElement('div');
    taskSection.className = 'text-center mt-4';
    const taskTitle = document.createElement('h2');
    taskTitle.className = 'text-xl font-semibold';
    taskTitle.textContent = 'Select a Task:';
    taskSection.appendChild(taskTitle);
    
    const buttonGrid = document.createElement('div');
    buttonGrid.className = 'grid grid-cols-2 gap-3 mt-4 w-full';
    buttonGrid.style.display = 'grid';
    buttonGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    buttonGrid.style.gap = '0.75rem';

    const tasks = [
        { text: 'Tab Track', icon: '📊', link: '/tab-track', position: 'top-left' },
        { text: 'Pomodoro', icon: '⏳', link: '/pomodoro', position: 'top-right' },
        { text: 'Whitelist', icon: '🔒', link: '/whitelist', position: 'bottom-left' },
        { text: 'Leaderboard', icon: '🏆', link: '/leaderboard', position: 'bottom-right' }
    ];

    tasks.forEach(task => {
        const button = Link(
            task.link, 
            `<div class="text-lg font-medium">${task.icon}<br>${task.text}</div>`, 
            'w-full flex items-center justify-center bg-yellow-400 text-gray-800 rounded-lg shadow-lg p-2 hover:bg-yellow-300 transition border border-gray-300'
        );
        button.style.minWidth = '100px';
        button.style.minHeight = '60px';
        buttonGrid.appendChild(button);
    });
    
    const coffeeButton = document.createElement('button');
    coffeeButton.className = 'w-full mt-6 flex items-center justify-center bg-yellow-400 text-gray-800 rounded-lg shadow-lg p-3 hover:bg-yellow-300 transition text-lg font-medium';
    coffeeButton.innerHTML = '☕ Enjoying your concentration? Buy us a coffee! <span class="ml-2">➡️</span>';
    
    container.appendChild(title);
    container.appendChild(underline);
    container.appendChild(taskSection);
    container.appendChild(buttonGrid);
    container.appendChild(coffeeButton);

    return container;
} 