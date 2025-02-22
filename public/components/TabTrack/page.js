import { Link } from '../../popup.js';



export function TabTrack() {
    const container = document.createElement('div');
    container.className = 'mt-5 flex flex-col items-start';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'Enter a Task';
    
    const underline = document.createElement('hr');
    underline.className = 'my-4 border-gray-300';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'textarea';
    textarea.placeholder = 'Enter your task here...';
    
    const submitButton = document.createElement('button');
    submitButton.className = 'button button-yellow mt-5';
    submitButton.textContent = 'Start Tracking';
    
    // Task display section
    const taskDisplay = document.createElement('div');
    taskDisplay.className = 'task-display mt-4';
    
    const clearButton = document.createElement('button');
    clearButton.className = 'button button-gray mt-2';
    clearButton.textContent = 'Clear Tasks';
    
    // Task display section
    const taskDisplay = document.createElement('div');
    taskDisplay.className = 'task-display mt-4';
    
    submitButton.addEventListener('click', () => {
        const taskText = textarea.value.trim();
        if (taskText) {
            console.log("User input received:", taskText);
            // Send message to background script
            chrome.runtime.sendMessage({
                type: "startTracking",
                goal: taskText
            }, function(response) {
                // Log the entire response to see what we're getting
                console.log("Full response from background:", response);
                
            }, function(response) {
                // Log the entire response to see what we're getting
                console.log("Full response from background:", response);
                
                if (response && response.success) {
                    console.log("Tracking started with goal:", response.goal);
                    alert("Task tracking started!");
                    setTimeout(() => {
                        window.location.hash = '/main';
                        window.location.hash = '/main';
                    }, 100);
                } else {
                    console.error("Failed to start tracking:", response);
                } else {
                    console.error("Failed to start tracking:", response);
                }
            });
        } else {
            alert("Please enter a task first!");
        }
    });
    
    function displayTask(task) {
        console.log("Displaying task:", task); // Debugging log
        // Clear previous task display
        taskDisplay.innerHTML = '';

        const taskItem = document.createElement('div');
        taskItem.className = 'task-item flex justify-between items-center p-2 border rounded bg-gray-100 mt-2';

        const taskText = document.createElement('span');
        taskText.textContent = task;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'button button-red';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            taskDisplay.innerHTML = ''; // Clear the task display
            textarea.value = ''; // Clear the input field
            console.log("Task deleted.");
        });
        
        taskItem.appendChild(taskText);
        taskItem.appendChild(deleteButton);
        taskDisplay.appendChild(taskItem);
    }
    
    container.appendChild(title);
    container.appendChild(underline);
    container.appendChild(textarea);
    container.appendChild(submitButton);
    container.appendChild(clearButton);
    container.appendChild(taskDisplay);
    
    const backButton = Link('/main', 'Go Back', 'mt-5 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition button-right');
    container.appendChild(backButton);
    
    return container;
}