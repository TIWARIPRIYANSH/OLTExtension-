// background.js

// IMPORTANT: Replace this with your actual Google AI API key.
const API_KEY = "AIzaSyAS7vZN3fqi2PrQgu8_V_G7Ioglhzuj7FE";

// This is the corrected URL with the current model name.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// This function formats the data and calls the AI API.
async function fetchAiAnswer(questionData) {
  const prompt = `
    Please solve the following question. Analyze the problem and provide the correct option (e.g., A, B, C, or D) followed by a brief, step-by-step explanation.

    Question and Options Block:
    ${questionData.question}
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      // This is where your "API request failed with status 404" error comes from.
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!answerText) {
      throw new Error("Could not parse answer from API response.");
    }
    
    return answerText.trim();

  } catch (error) {
    console.error("API call error:", error);
    // This returns the final error message to the popup.
    return `Error: Could not get an answer from the AI. ${error.message}`;
  }
}

// Listen for messages from popup.js.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAiAnswer") {
    fetchAiAnswer(request.data).then(answer => {
      sendResponse({ answer: answer });
    });
    return true;
  }
});