// background.js (service worker)

/**
 * @author: Zahir
 * Desc: Listens for messages from the popup and starts the sending process. It expects an array of targets, a message, and a delay in seconds between messages.
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'startSend') {
    const { targets, message, delaySec } = msg;
    processQueue(targets, message, Number(delaySec) || 5);
    sendResponse({ ok: true });
  }
  return true;
});

/**
 * @author: Zahir
 * @desc: Main function to process the queue of targets. It creates one tab to WhatsApp Web and reuses it for all messages
 */
async function processQueue(targets, message, delaySec) {
  let tabId = null;

  try {
    // 1. Create one tab to reuse
    const tab = await createTab("https://web.whatsapp.com");
    tabId = tab.id;
    // Wait for initial WhatsApp load (QR code scan etc)
    // If you are already logged in, this waits for the list to load.
    await sleep(5000); 

    for (let i = 0; i < targets.length; i++) {
      const rawTarget = targets[i];
      // Determine if it looks like a phone number (only digits, +, spaces, dashes)
      // or a Group Name (contains letters)
      const isPhoneNumber = /^[\d\+\-\s]+$/.test(rawTarget);
      
      console.log(`Processing ${i + 1}/${targets.length}: ${rawTarget} (${isPhoneNumber ? 'Number' : 'Group'})`);

      try {
        if (isPhoneNumber) {
          // --- STRATEGY A: PHONE NUMBER (URL Method) ---
          const number = rawTarget.replace(/\D/g, ''); // clean formatting
          if (number.length < 5) continue; 

          const url = `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
          
          await updateTabAndWait(tabId, url);
          // Wait for chat to load specific conversation
          await sleep(3000); 
          
          // Click send
          await injectClickSend(tabId);

        } else {
          // --- STRATEGY B: GROUP / CONTACT NAME (Search Method) ---
          
          // Ensure we are on home screen to search
          // We don't want ?phone=... in the url
          await updateTabAndWait(tabId, "https://web.whatsapp.com/");
          await sleep(2500); // Wait for search bar to appear

          // Inject complex script to: Search -> Click Result -> Type Message -> Click Send
          await injectGroupSender(tabId, rawTarget, message);
        }

      } catch (err) {
        console.error(`Error processing ${rawTarget}:`, err);
      }

      // Wait delay before next
      await sleep(delaySec * 1000);
    }
    console.log("Batch finished.");

  } catch (err) {
    console.error("Fatal error:", err);
  }
}

// --- Helpers ---

/**
 * @author: Zahir
 * DESC: Creates a new tab and returns a promise that resolves with the tab object once created
 */
function createTab(url) {
  return new Promise(resolve => {
    chrome.tabs.create({ url, active: true }, tab => resolve(tab));
  });
}

/**
 * @author: Zahir
 * Desc: Updates the given tab with a new URL and returns a promise that resolves once the page is fully loaded (status 'complete')
 */
function updateTabAndWait(tabId, url) {
  return new Promise((resolve) => {
    chrome.tabs.update(tabId, { url }, () => {
      const listener = (tid, changeInfo, tab) => {
        if (tid === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve(tab);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Helper: Just clicks the send button (for URL method)
function injectClickSend(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // Try to find the send button
      const btn = document.querySelector('span[data-icon="send"]')?.closest('button') 
               || document.querySelector('button[aria-label="Send"]');
      if (btn) btn.click();
    }
  });
}

// Helper: Complex script for Groups
function injectGroupSender(tabId, targetName, messageText) {
  return chrome.scripting.executeScript({
    target: { tabId },
    args: [targetName, messageText],
    func: async (name, msg) => {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));

      // 1. Find Search Bar (Side Panel)
      // WhatsApp selectors change often. Looking for the first contenteditable usually works for search.
      // Or looking for the specific container in the side pane.
      const sidePane = document.getElementById('side');
      if (!sidePane) return console.error("Side pane not found");
      
      const searchInput = sidePane.querySelector('div[contenteditable="true"]');
      if (!searchInput) return console.error("Search input not found");

      // 2. Type Group Name into Search
      searchInput.focus();
      // Deprecated but most reliable way to trigger React internal state updates
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, name);
      
      await sleep(2000); // Wait for search results

      // 3. Select the first result (Press Enter)
      // We dispatch a specific keydown event that WhatsApp listens to
      const enterEvent = new KeyboardEvent('keydown', {
        bubbles: true, cancelable: true, keyCode: 13, which: 13, key: 'Enter'
      });
      searchInput.dispatchEvent(enterEvent);

      await sleep(2000); // Wait for chat to open

      // 4. Find Message Input (Footer)
      const mainFooter = document.querySelector('footer');
      if (!mainFooter) return console.error("Footer not found");
      
      const msgInput = mainFooter.querySelector('div[contenteditable="true"]');
      if (!msgInput) return console.error("Message input not found");

      // 5. Type Message
      msgInput.focus();
      document.execCommand('insertText', false, msg);
      
      await sleep(800);

      // 6. Click Send
      const sendBtn = document.querySelector('span[data-icon="send"]')?.closest('button') 
                   || document.querySelector('button[aria-label="Send"]');
      
      if (sendBtn) {
        sendBtn.click();
      } else {
        console.error("Send button not found after typing");
      }
    }
  });
}