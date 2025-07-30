document.addEventListener('DOMContentLoaded', () => {

  async function getQuestionFromPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ['content.js']
    });

    for (const frameResult of injectionResults) {
      if (frameResult.result) {
        return frameResult.result;
      }
    }
    return null;
  }

  document.getElementById('findQuestionBtn').addEventListener('click', async () => {
    const answerDisplay = document.getElementById('answerDisplay');
    const answerTextElem = document.getElementById('answerText');

    answerDisplay.style.display = 'block';
    answerTextElem.innerText = 'Extracting question...';

    try {
      const extractedData = await getQuestionFromPage();

      if (!extractedData) {
        throw new Error("Could not find the question data in any frame.");
      }
      
      if (extractedData.error) {
        throw new Error(extractedData.error);
      }

      if (extractedData.question) {
        answerTextElem.innerText = 'Asking AI... 🤔';

        const aiResponse = await chrome.runtime.sendMessage({
          action: "getAiAnswer",
          data: extractedData
        });

        if (aiResponse && aiResponse.answer) {
          answerTextElem.innerText = aiResponse.answer;
        } else {
          throw new Error(aiResponse.error || "No valid answer received from AI.");
        }
      } else {
        throw new Error("Extraction failed: no question text found.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      answerTextElem.innerText = `Error: ${error.message}`;
    }
  });

});