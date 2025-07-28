// Function to communicate with the content script and get the question data.
async function getQuestionFromPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send a message to the content script in the active tab.
  const response = await chrome.tabs.sendMessage(tab.id, { action: "extractQuestionData" });
  
  // The response will be the structured data: { question, options }
  return response;
}


// Main execution starts when the popup button is clicked.
document.getElementById('findQuestionBtn').addEventListener('click', async () => {
  const questionDisplay = document.getElementById('questionDisplay');
  const questionTextElem = document.getElementById('questionText');
  const answerDisplay = document.getElementById('answerDisplay');
  const answerTextElem = document.getElementById('answerText');

  // Show a loading/thinking state
  questionDisplay.style.display = 'none';
  answerDisplay.style.display = 'block';
  answerTextElem.innerText = 'Extracting question...';

  try {
    // 1. Get the structured data from the content script
    const extractedData = await getQuestionFromPage();

    if (extractedData && extractedData.question) {
      // Display the extracted question
      questionTextElem.innerText = extractedData.question;
      questionDisplay.style.display = 'block';
      answerTextElem.innerText = 'Asking AI... 🤔';

      // 2. Send the data to the background script to get the AI answer
      const aiResponse = await chrome.runtime.sendMessage({
        action: "getAiAnswer",
        data: extractedData
      });

      // 3. Display the final answer from the AI
      if (aiResponse && aiResponse.answer) {
        answerTextElem.innerText = aiResponse.answer;
      } else {
        throw new Error("No answer received from AI.");
      }
    } else {
      throw new Error("Could not extract question from the page.");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    answerTextElem.innerText = `Error: ${error.message}`;
    answerDisplay.style.display = 'block';
  }
});