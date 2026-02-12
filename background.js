// background.js (service worker)
const pendingMap = new Map();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'startSend') {
    const { numbers, message, delaySec } = msg;
    startSending(numbers, message, Number(delaySec) || 0);
    sendResponse({ ok: true });
  }
  return true;
});

async function startSending(numbers, message, delaySec) {
  // 1. Sanitize numbers
  const cleaned = numbers.map(n => n.replace(/\D/g, '')).filter(n => n.length > 6);

  if (cleaned.length === 0) return;

  let tabId = null;

  try {
    // 2. Open ONE tab initially (or reuse active WhatsApp tab if we wanted logic for that)
    // We start with a blank WhatsApp page to ensure we have a valid ID.
    const initialTab = await createTab("https://web.whatsapp.com");
    tabId = initialTab.id;

    // Wait a moment for the initial WhatsApp load (optional, but helps with session init)
    await sleep(2000);

    for (let i = 0; i < cleaned.length; i++) {
      const num = cleaned[i];
      const url = buildWhatsappUrl(num, message);

      console.log(`Processing ${i + 1}/${cleaned.length}: ${num}`);

      try {
        // 3. Update the EXISTING tab's URL
        await updateTabAndWait(tabId, url);

        // 4. Inject script to click send
        const result = await tryInjectSendClick(tabId);
        
        if (result.clicked) {
             console.log('Sent to', num);
        } else {
             console.warn('Could not click send for', num, result.error || 'Timeout');
        }

        // Mark for debug
        pendingMap.set(tabId, { number: num, url, sentAt: new Date().toISOString() });

      } catch (err) {
        console.error('Error processing', num, err);
        // If the tab was closed by user, this loop will fail. 
        // We could try to recover here, but usually, we stop.
        if (err.message && err.message.includes('No tab with id')) {
           console.log('Tab closed by user. Stopping.');
           break;
        }
      }

      // 5. Wait delay before next number
      await sleep(Math.max(1, delaySec) * 1000);
    }
    console.log('Bulk send finished.');

  } catch (err) {
    console.error("Fatal error in sending loop", err);
  }
}

function buildWhatsappUrl(number, message) {
  const encoded = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${number}&text=${encoded}`;
}

// Creates the initial tab
function createTab(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active: true }, (tab) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(tab);
    });
  });
}

// Updates an existing tab and waits for it to finish loading
function updateTabAndWait(tabId, url) {
  return new Promise((resolve, reject) => {
    // Navigate the tab
    chrome.tabs.update(tabId, { url }, (tab) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
    });

    // Listen for the loading completion
    const listener = (tid, changeInfo, updatedTab) => {
      if (tid !== tabId) return;
      
      // WhatsApp Web is an SPA (Single Page App). 
      // Sometimes status 'complete' fires early, but the chat isn't ready.
      // However, we need 'complete' to ensure the DOM is ready for injection.
      if (changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(updatedTab);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // Timeout fallback (30s)
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      // We resolve anyway to try injection, in case the status listener missed it
      resolve(); 
    }, 30000);
  });
}

function tryInjectSendClick(tabId) {
  return new Promise((resolve, reject) => {
    const injectionFn = () => {
      function waitForSendButtonAndClick(timeout = 15000) {
        return new Promise((res, rej) => {
          // WhatsApp selectors often change. These are common ones.
          const selectors = [
            'span[data-icon="send"]',
            'button[aria-label="Send"]',
            'button span[data-icon="send"]',
            'div[role="button"][aria-label="Send"]',
            // Sometimes it's a footer button
            'footer button' 
          ];

          const start = Date.now();

          const timer = setInterval(() => {
            // Check for timeout
            if (Date.now() - start > timeout) {
              clearInterval(timer);
              return res(false);
            }

            // check if the invalid number popup exists ("Phone number shared via url is invalid")
            const invalidText = document.body.innerText;
            if (invalidText && invalidText.includes("Phone number shared via url is invalid")) {
                clearInterval(timer);
                return res(false); // Can't send
            }

            // Try finding button
            for (const sel of selectors) {
              const els = document.querySelectorAll(sel);
              for (const el of els) {
                // Ensure it's visible and clickable
                if (el.offsetParent !== null) { 
                  const btn = el.closest('button') || el;
                  btn.click();
                  clearInterval(timer);
                  return res(true);
                }
              }
            }
          }, 1000); // Check every second
        });
      }

      return waitForSendButtonAndClick()
        .then(result => ({ clicked: result }))
        .catch(err => ({ clicked: false, error: String(err) }));
    };

    chrome.scripting.executeScript({
      target: { tabId },
      func: injectionFn
    }, (results) => {
      if (chrome.runtime.lastError) {
        // Tab likely closed or permission issue
        resolve({ clicked: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(results && results[0] && results[0].result || {});
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}