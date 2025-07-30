// background.js

// IMPORTANT: Replace this with your actual Google AI API key.
const API_KEY = process.env.GOOGLE_AI_API_KEY;

// This is the corrected URL with the current model name.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

// This function formats the data and calls the AI API.
// This is the updated function for background.js
async function fetchAiAnswer(questionData) {
  const prompt = `
    Analyze the following question and options. Provide a direct answer and a step-by-step explanation.
    Respond ONLY with a valid JSON object in the format: {"answer": "The correct option, e.g., 'C. one two'", "explanation": "Your step-by-step explanation here."}

    Question Block:
    ${questionData.question}
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Could not parse text from API response.");
    }
    
    // --- THIS IS THE FIX ---
    // Use a regular expression to find the JSON block within the raw text.
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      // If no JSON block is found, treat the whole response as the answer.
      console.warn("AI response did not contain a JSON block. Using raw text.");
      return { answer: rawText, explanation: "(The AI did not provide a structured JSON response)" };
    }

    try {
      // Parse only the extracted JSON string.
      const jsonResponse = JSON.parse(jsonMatch[0]);
      return jsonResponse;
    } catch (e) {
      throw new Error("Failed to parse the JSON extracted from the AI's response.");
    }

  } catch (error) {
    console.error("API call error:", error);
    return { error: `Could not get a valid answer from the AI. ${error.message}` };
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAiAnswer") {
    fetchAiAnswer(request.data).then(responseObject => {
      sendResponse(responseObject);
    });
    return true;
  }
});