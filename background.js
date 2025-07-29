// background.js

// IMPORTANT: Replace this with your actual Google AI API key.
const API_KEY = process.env.API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
// This function formats the data and calls the AI API.
async function fetchAiAnswer(questionData) {
  // Create a clear prompt for the AI.
  const prompt = `
    Please solve the following multiple-choice question. Analyze the problem and provide the correct option letter (e.g., A, B, C, or D) followed by a brief, step-by-step explanation.

    Question: ${questionData.question}

    Options:
    ${questionData.options.join("\n")}
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
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Safely extract the text from the API response.
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!answerText) {
      throw new Error("Could not parse answer from API response.");
    }
    
    return answerText.trim();

  } catch (error) {
    console.error("API call error:", error);
    return `Error: Could not get an answer from the AI. ${error.message}`;
  }
}

// Listen for messages from other parts of the extension (like popup.js).
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAiAnswer") {
    // Call the function to get the AI answer.
    fetchAiAnswer(request.data).then(answer => {
      // Send the answer back to the popup.
      sendResponse({ answer: answer });
    });
    // Return true to indicate that the response will be sent asynchronously.
    return true;
  }
});