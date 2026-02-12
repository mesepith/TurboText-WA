```md
# 🚀 TurboText WA – Bulk WhatsApp Sender (Chrome Extension)

TurboText WA is a Chrome Extension that allows you to send the same WhatsApp message to multiple phone numbers automatically using WhatsApp Web.

It opens a single WhatsApp Web tab, navigates through each number, injects a click on the send button, and applies a configurable delay between messages.

⚠️ Use responsibly. Respect WhatsApp’s terms of service.

---

## ✨ Features

- ✅ Send message to multiple numbers (one per line)
- ✅ Automatic send (no manual click required)
- ✅ Configurable delay between sends
- ✅ Uses only WhatsApp Web (no API required)
- ✅ Manifest V3 compliant
- ✅ Reuses single tab (efficient & cleaner)

---

## 📁 Project Structure

```

TurboText-WA/
│
├── manifest.json        # Chrome extension configuration
├── background.js        # Service worker (bulk logic)
├── popup.html           # UI layout
├── popup.js             # UI logic
├── popup.css            # Styling
└── icons/
├── icon16.png
├── icon48.png
└── icon128.png

````

---

## 🛠 How It Works

1. User enters phone numbers (international format)
2. User writes message
3. Clicks **Send**
4. Extension:
   - Opens WhatsApp Web
   - Navigates to each number via:
     ```
     https://web.whatsapp.com/send?phone=NUMBER&text=MESSAGE
     ```
   - Injects script to click the "Send" button
   - Waits configured delay
   - Moves to next number

---

## 📦 Installation (Developer Mode)

1. Open Chrome
2. Go to:


chrome://extensions/


3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the project folder

The extension icon will appear in your toolbar.

```

## 📲 Usage

1. Open WhatsApp Web and ensure you are logged in.
2. Click the TurboText WA extension icon.
3. Enter phone numbers in this format:



919876543210
919812345678

```

⚠️ Use full international format without `+`

4. Write your message.
5. Set delay (recommended: 5–10 seconds).
6. Click **Send**.

The extension will:
- Open one WhatsApp Web tab
- Automatically send messages sequentially

---

## ⏳ Delay Recommendation

To reduce risk:

- Small batch: 3–5 seconds
- Medium batch: 5–10 seconds
- Large batch: 10–20 seconds

Avoid sending too many messages too quickly.

---

## 🔐 Permissions Used

| Permission | Purpose |
|------------|----------|
| tabs | Open & update WhatsApp tab |
| scripting | Inject send-click script |
| storage | (Reserved for future features) |
| host_permissions | Access WhatsApp Web |

---

## 🧠 Important Notes

- This extension does NOT use WhatsApp Business API.
- It works purely via WhatsApp Web automation.
- If WhatsApp changes DOM selectors, send button detection may need update.
- Invalid numbers are skipped automatically.

---

## ⚠️ Disclaimer

This tool is intended for:

- Customer follow-ups
- Small business messaging
- Personal automation

You are responsible for:
- Complying with WhatsApp Terms of Service
- Avoiding spam
- Respecting user consent

The author is not responsible for account restrictions.

---

## 🛣 Future Improvements

- CSV import
- Status tracker (sent / failed)
- Randomized delay
- Batch limit control
- Scheduled sending
- Dark mode UI
- Error reporting panel

---

## 👨‍💻 Version

**v1.0**
- Initial bulk sender
- Automatic send injection
- Delay control

---

## 💬 Support

Test with 1–2 numbers before sending large batches.

---

## ⭐ TurboText WA

Fast. Simple. Automated.

```