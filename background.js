// background.js (service worker)
const pendingMap = new Map(); // map tabId -> info (for debugging/tracking)

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'startSend') {
    const { numbers, message, delaySec } = msg;
    startSending(numbers, message, Number(delaySec) || 0);
    sendResponse({ ok: true });
  }
  // keep message channel open? Not necessary here.
  return true;
});

async function startSending(numbers, message, delaySec) {
  // sanitize numbers: remove anything non-digit
  const cleaned = numbers.map(n => n.replace(/\D/g, '')).filter(n => n.length > 6);

  for (let i = 0; i < cleaned.length; i++) {
    const num = cleaned[i];
    const url = buildWhatsappUrl(num, message);
    try {
      const tab = await createTabAndWait(url);
      // inject script to click send
      await tryInjectSendClick(tab.id);
      // mark tab in pendingMap for debug
      pendingMap.set(tab.id, { number: num, url, sentAt: new Date().toISOString() });
    } catch (err) {
      console.error('Error sending to', num, err);
    }
    // wait delay before next
    await sleep(Math.max(0, delaySec) * 1000);
  }
  // done
  console.log('Bulk send finished.');
}

function buildWhatsappUrl(number, message) {
  // whatsapp web send URL accepts text param
  const encoded = encodeURIComponent(message);
  // Use web.whatsapp.com/send?phone=...
  return `https://web.whatsapp.com/send?phone=${number}&text=${encoded}`;
}

function createTabAndWait(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active: false }, (tab) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      // wait for tab to complete loading (status == 'complete' and URL contains web.whatsapp.com)
      const listener = (tabId, changeInfo, updatedTab) => {
        if (tabId !== tab.id) return;
        // wait for complete
        if (changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve(updatedTab);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      // fallback timeout: if nothing happens in 30s, resolve with current tab
      setTimeout(async () => {
        try {
          const t = await chrome.tabs.get(tab.id);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve(t);
        } catch (e) {
          reject(e);
        }
      }, 30000);
    });
  });
}

function tryInjectSendClick(tabId) {
  // We'll execute a function in the tab that tries a few selectors to find and click send.
  return new Promise((resolve, reject) => {
    const injectionFn = () => {
      // This function runs in the page context.
      function waitForSendButtonAndClick(timeout = 20000) {
        return new Promise((res, rej) => {
          const selectors = [
            'button[data-testid="compose-btn-send"]',
            'button[aria-label="Send"]',
            'button._4sWnG', // backup class (may change)
            'span[data-icon="send"]',
            'div[role="button"][data-testid="send"]'
          ];

          function tryClick() {
            for (const sel of selectors) {
              const el = document.querySelector(sel);
              if (el) {
                // If it's a span inside a button, climb to parent button
                const btn = el.closest('button') || el;
                try {
                  btn.click();
                  return true;
                } catch (e) {
                  // ignore
                }
              }
            }
            return false;
          }

          if (tryClick()) return res(true);

          // Observe DOM changes in case WhatsApp loads send button later
          const obs = new MutationObserver(() => {
            if (tryClick()) {
              obs.disconnect();
              res(true);
            }
          });

          obs.observe(document.body, { childList: true, subtree: true });

          // timeout
          setTimeout(() => {
            obs.disconnect();
            // If not found, still resolve false to allow continuation
            res(false);
          }, timeout);
        });
      }

      // run
      return waitForSendButtonAndClick(15000)
        .then(result => ({ clicked: !!result }))
        .catch(err => ({ clicked: false, error: String(err) }));
    };

    chrome.scripting.executeScript({
      target: { tabId },
      func: injectionFn
    }, (results) => {
      if (chrome.runtime.lastError) {
        // Possibly page blocked injection; resolve so we continue
        console.warn('Injection error:', chrome.runtime.lastError.message);
        resolve({ injected: false, error: chrome.runtime.lastError.message });
        return;
      }
      // results is an array; take first
      resolve(results && results[0] && results[0].result || {});
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
