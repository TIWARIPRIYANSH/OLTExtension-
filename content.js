// Function to communicate with the content script and get the question data.
async function getQuestionFromPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { action: "extractQuestionData" });
  return response;
}

// Main execution starts when the popup button is clicked.
document.getElementById('findQuestionBtn').addEventListener('click', async () => {
  const questionDisplay = document.getElementById('questionDisplay');
  const questionTextElem = document.getElementById('questionText');
  const answerDisplay = document.getElementById('answerDisplay');
  const answerTextElem = document.getElementById('answerText');

  questionDisplay.style.display = 'none';
  answerDisplay.style.display = 'block';
  answerTextElem.innerText = 'Extracting question...';

  try {
    const extractedData = await getQuestionFromPage();

    // --- THIS IS THE FIX ---
    // First, check if content.js sent back a specific error.
    if (extractedData && extractedData.error) {
      throw new Error(extractedData.error);
    }

    // If no error, proceed to check for the question.
    if (extractedData && extractedData.question) {
      questionTextElem.innerText = extractedData.question;
      questionDisplay.style.display = 'block';
      answerTextElem.innerText = 'Asking AI... 🤔';

      const aiResponse = await chrome.runtime.sendMessage({
        action: "getAiAnswer",
        data: extractedData
      });

      if (aiResponse && aiResponse.answer) {
        answerTextElem.innerText = aiResponse.answer;
      } else {
        throw new Error("No answer received from AI.");
      }
    } else {
      // This is now a fallback for unexpected responses.
      throw new Error("Could not extract question from the page (unexpected response).");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    answerTextElem.innerText = `Error: ${error.message}`;
    answerDisplay.style.display = 'block';
  }
});