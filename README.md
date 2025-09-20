TruthLens – AI-Powered Misinformation Detection Tool

TruthLens is a Chrome extension designed to help users detect potential misinformation online and verify claims with trusted sources. By combining AI analysis with curated fact-checking links, TruthLens empowers users to think critically and make informed decisions while browsing the web.

Features

AI Analysis of Claims

Paste any text or highlight text on a webpage to let the AI check for misinformation.

Uses DeepSeek AI model from Hugging Face to provide a yes/no evaluation with a brief explanation.

Context Menu Verification

Right-click any selected text to instantly analyze it without leaving the page.

Fact-Checking Links

Generates one-click links to trusted fact-checking sites:

Snopes

PolitiFact

AltNews

BoomLive

Factly

Includes Google and Bing search links tailored to the claim.

User-Friendly Popup

Shows the current website domain for context.

Displays AI results and verification links in a clear, readable interface.

Notifications

Non-intrusive toast notifications display AI results in real-time while browsing.

API Key Management

Users can securely save their Hugging Face API key in the extension options for seamless AI processing.

How It Works

Input

Users provide a claim via popup or highlighted text.

AI Analysis

The text is sent to Hugging Face’s DeepSeek AI model.

The AI evaluates whether the content may be misleading or false.

Fact-Checking

TruthLens generates relevant fact-check links for self-verification.

Results Display

Results are shown in the popup and/or as a toast notification with clear explanations and verification links.

Installation

Clone or download this repository.

Open Chrome and go to chrome://extensions/.

Enable Developer Mode.

Click Load unpacked and select the project folder.

Open the popup and enter your Hugging Face API key in the options page.

Technologies Used

JavaScript / HTML / CSS – Chrome extension front-end and UI.

Chrome Extension APIs – Tabs, storage, context menus, notifications.

Hugging Face DeepSeek API – AI-powered claim analysis.

Toast Notifications – Non-intrusive feedback to the user.

Project Structure
TruthLens/
├── popup.html        # Main UI popup
├── popup.js          # Popup functionality
├── options.html      # Options page for API key
├── options.js        # API key management
├── content.js        # Injected script for notifications
├── service_worker.js # Background tasks and context menu
├── popup.css         # Styling for popup
├── icons/            # Extension icons
└── manifest.json     # Chrome extension manifest

Usage

Open any webpage.

Highlight a claim and right-click → TruthLens: AI verify selection, or open the popup and paste a claim.

View AI analysis and fact-check links.

Click links to verify information using trusted sources.

Contribution

Contributions are welcome! You can:

Improve the UI/UX

Add more fact-checking sources

Optimize AI queries for faster results

Please open a pull request or issue for suggestions.

License

MIT License – free to use and modify.
