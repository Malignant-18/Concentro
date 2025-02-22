import { Link } from '../../popup.js';

export function TabTrack() {
    const container = document.createElement('div');
    container.className = 'mt-5 flex flex-col items-start';
    
    const backButton = document.createElement('button');
    backButton.className = 'button button-gray mr-2';
    backButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-arrow-left">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 12H8"/>
            <path d="m12 8-4 4 4 4"/>
        </svg>
    `;
    backButton.onclick = () => {
        window.location.href = '/main';
    };

    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold flex items-center';
    title.innerHTML = `${backButton.outerHTML} Enter a Task`;

    const underline = document.createElement('hr');
    underline.className = 'my-4 border-gray-300';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'textarea';
    textarea.placeholder = 'Enter your task here...';
    
    const submitButton = document.createElement('button');
    submitButton.className = 'button button-yellow mt-5';
    submitButton.textContent = 'Start Tracking';
    
    submitButton.addEventListener('click', () => {
        const taskText = textarea.value.trim();
        if (taskText) {
            console.log("User input received:", taskText);
            chrome.runtime.sendMessage({
                type: "startTracking",
                goal: taskText
            }, (response) => {
                if (response && response.success) {
                    console.log("Tracking started with goal:", response.goal);
                    alert("Task tracking started!");
                    setTimeout(() => {
                        window.location.href = '/main';
                    }, 100);
                }
            });
        } else {
            alert("Please enter a task first!");
        }
    });
    
    container.appendChild(title);
    container.appendChild(underline);
    container.appendChild(textarea);
    container.appendChild(submitButton);
    
    return container;
} 