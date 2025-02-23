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
    
    const clearButton = document.createElement('button');
    clearButton.className = 'button button-gray mt-2';
    clearButton.textContent = 'Clear Tasks';
    
    const taskDisplay = document.createElement('div');
    taskDisplay.className = 'task-display mt-4';
    
    submitButton.addEventListener('click', () => {
        const taskText = textarea.value.trim();
        if (taskText) {
            console.log("User input received:", taskText);
            chrome.runtime.sendMessage({
                type: "startTracking",
                goal: taskText
            }, function(response) {
                console.log("Full response from background:", response);
                
                if (response && response.success) {
                    console.log("Tracking started with goal:", response.goal);
                    console.log("Tracking data from backend:", response);
                     displayTask(taskText);
                    
                    alert("Task tracking started!");
                    setTimeout(() => {
                        window.location.hash = '/main';
                    }, 100);
                } else {
                    console.error("Failed to start tracking:", response);
                }
            });
        } else {
            alert("Please enter a task first!");
        }
    });
    clearButton.addEventListener("click", () => {
        console.log("User pressed clear button");
      
        chrome.runtime.sendMessage({ type: "stopTracking" }, function (response) {
          if (chrome.runtime.lastError) {
            console.error("Error sending stopTracking message:", chrome.runtime.lastError.message);
            return;
          }
                console.log("Full response from background:", response);
      
          if (response && response.success) {
            console.log("Tracking successfully stopped.");
            document.getElementById("title").innerText = "TrackingStopped"; 
          } else {
            console.error("Failed to stop tracking.");
          }
        });
      });
      
    
    function displayTask(task) {
        console.log("Displaying task:", task);
        taskDisplay.innerHTML = '';

        const taskItem = document.createElement('div');
        taskItem.className = 'task-item flex justify-between items-center p-2 border rounded bg-gray-100 mt-2';

        const taskText = document.createElement('span');
        taskText.textContent = task;
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'button button-red';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            taskDisplay.innerHTML = ''; 
            textarea.value = ''; 
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
