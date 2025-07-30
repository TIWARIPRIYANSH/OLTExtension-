// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const findBtn = document.getElementById('findQuestionBtn');
  const resultContainer = document.getElementById('resultContainer');
  const highlightedAnswerElem = document.getElementById('highlightedAnswer');
  const explanationElem = document.getElementById('explanationText');
  const statusTextElem = document.getElementById('statusText');
  const themeToggle = document.getElementById('themeToggle');

  // --- Theme Logic ---
  // Load saved theme and set toggle state
  chrome.storage.local.get('theme', ({ theme }) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggle.checked = true;
    }
  });

  // Handle theme toggle clicks
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('dark-mode');
      chrome.storage.local.set({ theme: 'dark' });
    } else {
      document.body.classList.remove('dark-mode');
      chrome.storage.local.set({ theme: 'light' });
    }
  });

  // --- Main Execution Logic ---
  findBtn.addEventListener('click', async () => {
    resultContainer.style.display = 'none';
    statusTextElem.style.display = 'block';
    statusTextElem.innerText = 'Extracting question...';

    try {
      const extractedData = await getQuestionFromPage();

      if (!extractedData) throw new Error("Could not find the question data in any frame.");
      if (extractedData.error) throw new Error(extractedData.error);
      
      if (extractedData.question) {
        statusTextElem.innerText = 'Asking AI... 🤔';
        
        const aiResponse = await chrome.runtime.sendMessage({ action: "getAiAnswer", data: extractedData });
        
        if (aiResponse.error) throw new Error(aiResponse.error);

        if (aiResponse && aiResponse.answer) {
          highlightedAnswerElem.innerText = aiResponse.answer;
          explanationElem.innerText = aiResponse.explanation;
          resultContainer.style.display = 'block';
          statusTextElem.style.display = 'none';
        } else {
          throw new Error("Received an invalid response from the AI.");
        }
      } else {
        throw new Error("Extraction failed: no question text found.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      statusTextElem.innerText = `Error: ${error.message}`;
    }
  });
  
  // --- Helper Function ---
  async function getQuestionFromPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ['content.js']
    });

    for (const frameResult of injectionResults) {
      if (frameResult.result) return frameResult.result;
    }
    return null;
  }
});