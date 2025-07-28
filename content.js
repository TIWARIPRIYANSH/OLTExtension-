// This function contains the extraction and refinement logic we developed.
function extractQuestionData() {
  const questionContainer = document.querySelector('#lblQuestion');

  if (!questionContainer) {
    throw new Error("Question container ('#lblQuestion') not found.");
  }
  
  // --- IMAGE CHECK ---
  // Check if there is an <img> tag inside the question container.
  const imageElement = questionContainer.querySelector('img');
  if (imageElement) {
    // If an image is found, throw a specific error.
    throw new Error("Question is an image. Not applicable for text extraction.");
  }
  
  // If no image, proceed with text extraction.
  const allDivs = questionContainer.querySelectorAll('div');
  const questionText = allDivs[0]?.innerText.trim();

  if (!questionText) {
    throw new Error("Could not find question text.");
  }

  const options = [];
  for (let i = 1; i < allDivs.length; i++) {
    const optionText = allDivs[i].innerText.trim();
    if (optionText) {
      options.push(optionText);
    }
  }

  return { question: questionText, options: options };
}

// --- MESSAGE LISTENER ---
// This part listens for the request from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractQuestionData") {
    console.log("Content script received request to extract data.");
    try {
      const data = extractQuestionData();
      sendResponse(data);
    } catch (error) {
      // Send the error message back to the popup if something goes wrong.
      sendResponse({ error: error.message });
    }
    // Return true to indicate you wish to send a response asynchronously.
    return true; 
  }
});