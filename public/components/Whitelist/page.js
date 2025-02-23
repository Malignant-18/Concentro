import { Link } from '../../popup.js';

export function Whitelist() {
    const container = document.createElement('div');
    container.className = 'mt-5';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl font-bold';
    title.textContent = 'List';

    const underline = document.createElement('hr');
    underline.className = 'my-4 border-gray-300';
    
    const whitelistContainer = document.createElement('div');
    whitelistContainer.className = 'mt-4';
    const whitelistTitle = document.createElement('h2');

    whitelistTitle.textContent = 'Whitelist Entries:';
    whitelistContainer.appendChild(whitelistTitle);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mt-5 w-full p-2 border border-gray-400 rounded';
    input.placeholder = 'eg : stackoverflow.com';
    
    const addButton = document.createElement('button');
    addButton.className = 'mt-5 px-4 py-2 bg-yellow-400 text-gray-800 rounded hover:bg-yellow-300 transition button';
    addButton.textContent = 'Add + ';
    

    const whitelistList = document.createElement('ul');
    whitelistContainer.appendChild(whitelistList);

    const blacklistContainer = document.createElement('div');
    blacklistContainer.className = 'mt-4';
    const blacklistTitle = document.createElement('h2');
    blacklistTitle.textContent = 'Blacklist Entries:';
    blacklistContainer.appendChild(blacklistTitle);

    const blacklistList = document.createElement('ul');
    blacklistContainer.appendChild(blacklistList);

    const blacklistInput = document.createElement('input');
    blacklistInput.type = 'text';
    blacklistInput.className = 'mt-5 w-full p-2 border border-gray-400 rounded';
    blacklistInput.placeholder = 'eg : instagram.com';

    const addBlacklistButton = document.createElement('button');
    addBlacklistButton.className = 'mt-5 px-4 py-2 bg-red-400 text-white rounded hover:bg-red-300 transition button';
    addBlacklistButton.textContent = 'Add + ';

// Function to create list item with delete button
function createListItem(url, list, storageKey) {
    const listItem = document.createElement('li');
    listItem.className = 'list-item'; // Assign a CSS class

    const urlText = document.createElement('span');
    urlText.textContent = url;
    urlText.className = 'url-text'; // Assign a CSS class

    const deleteButton = document.createElement('button');
    deleteButton.className = 'custom-delete-btn'; // Assign a CSS class
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', async () => {
        const { [storageKey]: urls = [] } = await chrome.storage.local.get([storageKey]);
        const updatedUrls = urls.filter(item => item !== url);
        await chrome.storage.local.set({ [storageKey]: updatedUrls });
        listItem.remove();
    });

    listItem.appendChild(urlText);
    listItem.appendChild(deleteButton);
    list.appendChild(listItem);
}

    // Function to load existing entries
    async function loadExistingEntries() {
        const { whitelist = [] } = await chrome.storage.local.get(['whitelist']);
        const { blacklist = [] } = await chrome.storage.local.get(['blacklist']);

        // Clear existing items
        whitelistList.innerHTML = '';
        blacklistList.innerHTML = '';

        // Load whitelist entries
        whitelist.forEach(url => {
            createListItem(url, whitelistList, 'whitelist');
        });

        // Load blacklist entries
        blacklist.forEach(url => {
            createListItem(url, blacklistList, 'blacklist');
        });
    }

    // Load existing entries when component is created
    loadExistingEntries();

    // Add entry to whitelist
    addButton.addEventListener('click', async () => {
        const url = input.value.trim();
        if (url) {
            const { whitelist = [] } = await chrome.storage.local.get(['whitelist']);
            if (!whitelist.includes(url)) {  // Prevent duplicate entries
                whitelist.push(url);
                await chrome.storage.local.set({ whitelist });
                createListItem(url, whitelistList, 'whitelist');
                input.value = ''; // Clear input field
            } else {
                alert("This URL is already in the whitelist!");
            }
        } else {
            alert("Please enter a URL for the whitelist!");
        }
    });

    // Add entry to blacklist
    addBlacklistButton.addEventListener('click', async () => {
        const url = blacklistInput.value.trim();
        if (url) {
            const { blacklist = [] } = await chrome.storage.local.get(['blacklist']);
            if (!blacklist.includes(url)) {  // Prevent duplicate entries
                blacklist.push(url);
                await chrome.storage.local.set({ blacklist });
                createListItem(url, blacklistList, 'blacklist');
                blacklistInput.value = ''; // Clear input field
            } else {
                alert("This URL is already in the blacklist!");
            }
        } else {
            alert("Please enter a URL for the blacklist!");
        }
    });

    const submitButton = document.createElement('button');
    submitButton.className = 'mt-5 px-4 py-2 bg-blue-400 text-white rounded hover:bg-blue-300 transition button';
    submitButton.textContent = 'Submit Task !';

    submitButton.addEventListener('click', async () => {
        const taskText = input.value.trim();
        const { whitelist = [] } = await chrome.storage.local.get(['whitelist']);
        const { blacklist = [] } = await chrome.storage.local.get(['blacklist']);

        console.log("Received whitelist:", whitelist); // Log the received whitelist
        console.log("Received blacklist:", blacklist); // Log the received blacklist

        if (taskText) {
            console.log("User input received:", taskText);
            // Send message to background script
            chrome.runtime.sendMessage({
                type: "startTracking",
                goal: taskText,
                whitelist: whitelist || [],
                blacklist: blacklist || []
            }, function(response) {
                console.log("Full response from background:", response);
                if (response && response.success) {
                    console.log("Tracking started with goal:", response.goal);
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

    container.appendChild(title);
    container.appendChild(underline);
    container.appendChild(whitelistContainer);
    container.appendChild(input);
    container.appendChild(addButton);
    container.appendChild(whitelistList);
    container.appendChild(blacklistContainer);
    container.appendChild(blacklistInput);
    container.appendChild(addBlacklistButton);
    container.appendChild(blacklistList);
    container.appendChild(submitButton);
    container.appendChild(Link('/main', ' Go Back', 'button-right'));
    
    return container;
} 