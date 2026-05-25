// popup.js
const targetsEl = document.getElementById('targets');
const messageEl = document.getElementById('message');
const delayEl = document.getElementById('delay');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

/** 
 * Author: Zahir
 * Desc: Sets the status message in the UI 
 */
function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? 'crimson' : 'black';
}

// Parse input into array of strings
function parseTargets(raw) {
  return raw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Handle send button click
sendBtn.addEventListener('click', async () => {
  const raw = targetsEl.value;
  const message = messageEl.value.trim();
  const delaySec = Math.max(2, parseFloat(delayEl.value) || 2); // Minimum 2s delay recommended for UI ops

  const targets = parseTargets(raw);
  if (!targets.length) {
    setStatus('Please add at least one number or group name.', true);
    return;
  }
  if (!message) {
    setStatus('Please write a message to send.', true);
    return;
  }

  // Disable UI
  sendBtn.disabled = true;
  clearBtn.disabled = true;
  setStatus(`Processing ${targets.length} target(s)...`);

  // Send to background
  try {
    chrome.runtime.sendMessage({
      action: 'startSend',
      targets,
      message,
      delaySec
    }, (resp) => {
      setStatus('Started. DO NOT close or minimize the WhatsApp tab that opens.');
      // Re-enable buttons after a short timeout so user knows it started
      setTimeout(() => {
        sendBtn.disabled = false;
        clearBtn.disabled = false;
      }, 2000);
    });
  } catch (err) {
    setStatus('Failed to start: ' + err.message, true);
    sendBtn.disabled = false;
    clearBtn.disabled = false;
  }
});

/**
 * @author: Zahir
 * Desc: Clears the input fields and status message when the clear button is clicked  
 */

clearBtn.addEventListener('click', () => {
  targetsEl.value = '';
  messageEl.value = '';
  setStatus('');
});