chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "displayTrackingResult") {
        // Create a popup div
        const popup = document.createElement('div');
        popup.classList.add('popup');

        // Display success or error message
        const statusMessage = message.success
            ? `Goal "${message.goal}" was successfully tracked!`
            : `Error: ${message.error || 'Unknown error'}`;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('popup-message');
        messageDiv.textContent = statusMessage;

        // Append message to the popup
        popup.appendChild(messageDiv);

        // Append the popup to the body
        document.body.appendChild(popup);

        // Remove popup after 5 seconds
        setTimeout(() => {
            popup.remove();
        }, 5000);
    }
});
const style = document.createElement('style');
style.textContent = `
  .popup {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px;
      background-color: #4CAF50;
      color: white;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      font-family: Arial, sans-serif;
  }
  
  .popup-message {
      font-size: 14px;
      font-weight: bold;
  }
`;
document.head.appendChild(style);
