# ⚡ TurboText WA

### Bulk WhatsApp Sender -- Chrome Extension

```{=html}
<p align="center">
```
`<img src="icons/icon128.png" width="120" alt="TurboText WA Logo">`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<b>`{=html}Send WhatsApp messages to multiple numbers automatically
using WhatsApp Web.`</b>`{=html}`<br>`{=html} Fast • Simple • Automated
```{=html}
</p>
```

------------------------------------------------------------------------

## 🚀 Overview

TurboText WA is a Chrome Extension that allows you to:

-   Send the same message to multiple WhatsApp numbers
-   Automatically click the send button
-   Add delay between messages
-   Use WhatsApp Web (no API required)

It opens a single WhatsApp Web tab and processes numbers sequentially.

------------------------------------------------------------------------

## ✨ Features

-   ✅ Bulk message sending\
-   ✅ Automatic send (no manual click)\
-   ✅ Configurable delay between messages\
-   ✅ Manifest V3 compliant\
-   ✅ Reuses single WhatsApp tab\
-   ✅ Invalid number detection

------------------------------------------------------------------------

## 📦 Project Structure

    TurboText-WA/
    │
    ├── manifest.json
    ├── background.js
    ├── popup.html
    ├── popup.js
    ├── popup.css
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png

------------------------------------------------------------------------

## 🔧 Installation (Developer Mode)

1.  Open Chrome\
2.  Go to: `chrome://extensions/`\
3.  Enable **Developer Mode**\
4.  Click **Load Unpacked**\
5.  Select this project folder

The extension will appear in your toolbar.

------------------------------------------------------------------------

## 📲 Usage

1.  Open **WhatsApp Web**
2.  Ensure you are logged in
3.  Click the extension icon
4.  Enter numbers in international format:

```{=html}
<!-- -->
```
    919876543210
    919812345678

⚠️ Do NOT use `+`

5.  Write your message\
6.  Set delay (recommended: 5--10 seconds)\
7.  Click **Send**

------------------------------------------------------------------------

## ⏳ Recommended Delay

  Batch Size   Recommended Delay
  ------------ -------------------
  Small        3--5 seconds
  Medium       5--10 seconds
  Large        10--20 seconds

Avoid sending too many messages too quickly.

------------------------------------------------------------------------

## 🔐 Permissions Used

  Permission           Purpose
  -------------------- ------------------------------
  `tabs`               Open & update WhatsApp tab
  `scripting`          Inject send-click script
  `storage`            Reserved for future features
  `host_permissions`   Access WhatsApp Web

------------------------------------------------------------------------

## ⚠️ Important Notes

-   This extension does NOT use WhatsApp Business API\
-   It works purely via WhatsApp Web automation\
-   If WhatsApp updates its UI, selectors may need update\
-   Use responsibly

------------------------------------------------------------------------

## 📌 Disclaimer

This tool is intended for:

-   Customer follow-ups\
-   Small business messaging\
-   Personal automation

You are responsible for complying with WhatsApp Terms of Service.

------------------------------------------------------------------------

## 🧠 Version

**v1.0**\
Initial bulk sender • Automatic send injection • Delay control

------------------------------------------------------------------------

```{=html}
<p align="center">
```
⚡ TurboText WA -- Fast. Simple. Automated.
```{=html}
</p>
```
