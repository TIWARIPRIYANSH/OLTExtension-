// A helper function that waits for an element to appear in the DOM
function waitForElement(selector, timeout = 3000) {
  return new Promise((resolve, reject) => {
    // Try to find it immediately
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    // If not found, set up an observer or interval
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        clearTimeout(timer);
        resolve(element);
      }
    }, 200); // Check every 200 milliseconds

    const timer = setTimeout(() => {
      clearInterval(interval);
      // Don't reject, just resolve with null so we know it wasn't found in this frame
      resolve(null); 
    }, timeout);
  });
}


async function findTargetData() {
  // Use our new function to wait for the main container to exist
  const mainContainer = await waitForElement('#TopContentDiv');

  // If the container doesn't appear after our timeout, we know this isn't the right frame
  if (!mainContainer) {
    return { type: 'nothing_found' };
  }

  // Once the container is found, the rest of the logic can run
  let passageText = '';
  let questionText = '';
  let imageSrc = null;

  const passageElement = mainContainer.querySelector('#divPassageText');
  if (passageElement && passageElement.offsetParent !== null) {
    passageText = passageElement.innerText.trim();
  }

  const questionElement = mainContainer.querySelector('#lblQuestion');
  if (questionElement) {
    const imageElement = questionElement.querySelector('img');
    if (imageElement) {
      imageSrc = imageElement.src;
    } else {
      const paragraphs = questionElement.querySelectorAll('p');
      if (paragraphs && paragraphs.length > 0) {
        questionText = Array.from(paragraphs).map(p => p.innerText).join('\n').trim();
      } else {
        questionText = questionElement.innerText.trim();
      }
    }
  }

  if (imageSrc) {
    return { type: 'image', data: imageSrc, context: passageText };
  } else if (questionText) {
    const combinedText = passageText ? `Context Passage:\n${passageText}\n\nQuestion:\n${questionText}` : questionText;
    return { type: 'text', data: combinedText };
  } else {
    return { type: 'nothing_found' };
  }
}

// The message listener now needs to handle the async function
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "findContent") {
    findTargetData().then(sendResponse);
    return true;
  }
});