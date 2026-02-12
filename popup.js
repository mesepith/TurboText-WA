// popup.js
const numbersEl = document.getElementById('numbers');
const messageEl = document.getElementById('message');
const delayEl = document.getElementById('delay');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? 'crimson' : 'black';
}

function parseNumbers(raw) {
  return raw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

sendBtn.addEventListener('click', async () => {
  const raw = numbersEl.value;
  const message = messageEl.value.trim();
  const delaySec = Math.max(0, parseFloat(delayEl.value) || 0);

  const numbers = parseNumbers(raw);
  if (!numbers.length) {
    setStatus('Please add at least one phone number.', true);
    return;
  }
  if (!message) {
    setStatus('Please write a message to send.', true);
    return;
  }

  // Disable UI while sending
  sendBtn.disabled = true;
  clearBtn.disabled = true;
  setStatus(`Sending to ${numbers.length} number(s)...`);

  // Send to background service worker
  try {
    chrome.runtime.sendMessage({
      action: 'startSend',
      numbers,
      message,
      delaySec
    }, (resp) => {
      // will get immediate ack; further progress shown by notifications or storage
      setStatus('Started sending. Tabs will open for each number. Monitor WhatsApp Web.');
      sendBtn.disabled = false;
      clearBtn.disabled = false;
    });
  } catch (err) {
    setStatus('Failed to start send: ' + err.message, true);
    sendBtn.disabled = false;
    clearBtn.disabled = false;
  }
});

clearBtn.addEventListener('click', () => {
  numbersEl.value = '';
  messageEl.value = '';
  setStatus('');
});
