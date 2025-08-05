// This function will be injected into the page.
function extractQuestionData() {
  const allQuestionContainers = document.querySelectorAll('div.Question');
  let visibleContainer = null;
  
  for (const container of allQuestionContainers) {
    if (container.offsetParent !== null) {
      visibleContainer = container;
      break;
    }
  }

  if (!visibleContainer) {
    return null;
  }

  const questionElement = visibleContainer.querySelector('#lblQuestion');
  if (!questionElement) {
    return { error: "Found visible container, but it's missing '#lblQuestion'." };
  }
  
  const imageElement = questionElement.querySelector('img');
  if (imageElement) {
    return { error: "Question is an image." };
  }
  
  const fullQuestionText = questionElement.innerText;
  if (!fullQuestionText || fullQuestionText.trim() === '') {
    return { error: "The visible question container appears to be empty." };
  }

  return { question: fullQuestionText, options: [] };
}


// --- Main Extension Logic ---
document.addEventListener('DOMContentLoaded', () => {

  async function getQuestionFromPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      func: extractQuestionData
    });

    for (const frameResult of injectionResults) {
      if (frameResult.result) {
        return frameResult.result;
      }
    }
    return null;
  }

  document.getElementById('findQuestionBtn').addEventListener('click', async () => {
    // --- THIS IS THE CORRECTED PART ---
    const resultContainer = document.getElementById('resultContainer');
    const highlightedAnswerElem = document.getElementById('highlightedAnswer');
    const explanationElem = document.getElementById('explanationText');
    const statusTextElem = document.getElementById('statusText');

    resultContainer.style.display = 'none';
    statusTextElem.style.display = 'block';
    statusTextElem.innerText = 'Extracting question...';
    // --- End of correction ---

    try {
      const extractedData = await getQuestionFromPage();

      if (!extractedData) throw new Error("Could not find the question data in any frame.");
      if (extractedData.error) throw new Error(extractedData.error);

      if (extractedData.question) {
        statusTextElem.innerText = 'Asking AI... 🤔';

        const aiResponse = await chrome.runtime.sendMessage({
          action: "getAiAnswer",
          data: extractedData
        });

        if (aiResponse && aiResponse.answer) {
          highlightedAnswerElem.innerText = aiResponse.answer;
          explanationElem.innerText = aiResponse.explanation;
          resultContainer.style.display = 'block';
          statusTextElem.style.display = 'none'; 
        } else {
          throw new Error(aiResponse.error || "No valid answer received from AI.");
        }
      } else {
        throw new Error("Extraction failed: no question text found.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      statusTextElem.innerText = `Error: ${error.message}`;
    }
  });

});