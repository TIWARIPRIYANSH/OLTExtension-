function extractQuestionData() {
  // This function only runs if it's inside a frame.
  // It looks for the question content within its current document context.
  const allQuestionContainers = document.querySelectorAll('div.Question');
  let visibleContainer = null;
  
  for (const container of allQuestionContainers) {
    if (container.offsetParent !== null) {
      visibleContainer = container;
      break;
    }
  }

  if (!visibleContainer) {
    // This is not an error, it just means this frame is not the right one.
    // Return null so the popup knows to check the next frame's result.
    return null;
  }

  const questionElement = visibleContainer.querySelector('#lblQuestion');
  if (!questionElement) {
    return { error: "Found visible question container, but it's missing '#lblQuestion' inside." };
  }
  
  const fullQuestionText = questionElement.innerText;

  if (!fullQuestionText || fullQuestionText.trim() === '') {
    return { error: "The visible question container appears to be empty." };
  }

  return { question: fullQuestionText, options: [] };
}

extractQuestionData();