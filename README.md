# TruthLens — Local AI Claim Analysis for Chrome

TruthLens is a Chrome extension that helps you assess potentially misleading online claims. It sends a claim to a **local Ollama model** for a preliminary assessment and provides links to search engines and fact-checking websites so you can investigate the claim independently.

> **Important:** TruthLens is an assistive tool, not an authoritative fact-checker. The local model does not independently browse the web or verify its answer against the linked websites. Check reliable sources before relying on an assessment.

## Features

- **Analyze a claim in the extension popup:** Paste a claim into the popup and select **AI Analyze**.
- **Analyze selected webpage text:** Highlight text, right-click, and select **TruthLens: AI verify selection**.
- **Local AI processing:** Uses Ollama with `qwen2.5:3b-instruct`; no cloud AI API key is required.
- **Structured assessments:** Prompts the model to report an assessment of **Supported**, **Contradicted**, or **Uncertain**, followed by an explanation and the evidence needed.
- **Independent verification links:** Builds claim-specific search links for Google, Bing, Snopes, PolitiFact, AltNews, BOOM Live, and Factly.
- **In-page results:** Displays selected-text analysis in a small toast notification.
- **Connection check:** The options page checks whether Ollama is reachable and whether the expected model is installed.

## How it works

1. You enter a claim in the popup or select text on a webpage.
2. The extension's Manifest V3 service worker sends the claim to Ollama's local chat endpoint at `http://localhost:11434/api/chat`.
3. Ollama runs `qwen2.5:3b-instruct` and returns a preliminary assessment.
4. TruthLens displays the model response and creates search links for independent checking. For right-click analysis, a content-script toast displays the result.

The response prompt instructs the model not to invent citations or claim that it searched the internet when it has not done so. This instruction helps guide the response, but it cannot guarantee that every answer is correct.

## Requirements

- Google Chrome or another Chromium-based browser that supports Manifest V3 extensions.
- [Ollama](https://ollama.com/) installed and running on the same computer as the browser.
- The model used by the current implementation: `qwen2.5:3b-instruct`.

## Setup

### 1. Install and start Ollama

Install Ollama from [ollama.com](https://ollama.com/), then download the model in a terminal:

```bash
ollama pull qwen2.5:3b-instruct
```

Make sure Ollama is running and serving its local API at `http://localhost:11434`. Depending on your operating system and installation, Ollama may start automatically. If it does not, start the Ollama application or run:

```bash
ollama serve
```

Keep the Ollama service running while using TruthLens.

### 2. Load TruthLens in Chrome

1. Download or clone this repository and extract it if necessary.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the project directory containing `manifest.json`.
6. Pin TruthLens to the browser toolbar for convenient access.

The `manifest.json` references `icons/16.png`, `icons/48.png`, and `icons/128.png`; make sure those icon files are present in the project directory.

### 3. Check the local model connection

1. Open the extension's options/settings page from Chrome's extension details.
2. Select **Check Ollama connection**.
3. A successful check reports that Ollama is reachable and `qwen2.5:3b-instruct` is installed.

If the model is missing, run `ollama pull qwen2.5:3b-instruct` and check again.

## Usage

### Analyze text from the popup

1. Open TruthLens from the Chrome toolbar.
2. Paste a claim into **Claim to analyze**.
3. Select **AI Analyze**.
4. Read the model's assessment and explanation.
5. Open the generated search or fact-checking links to examine external evidence.

### Analyze selected text on a webpage

1. Open an ordinary HTTP or HTTPS webpage.
2. Highlight the text you want to examine.
3. Right-click the selection.
4. Select **TruthLens: AI verify selection**.
5. Read the analysis in the TruthLens toast notification and use the available verification link(s).

Browser-internal pages such as `chrome://` pages generally do not allow content scripts to run, so selection-based analysis may not be available there.

## Project structure

```text
TruthLens/
├── manifest.json       # Manifest V3 configuration and permissions
├── service_worker.js   # Context menu, local Ollama requests, and search links
├── popup.html          # Extension popup interface
├── popup.css           # Popup styling
├── popup.js            # Popup input, results, and verification links
├── content.js          # In-page toast for selected-text results
├── options.html        # Settings page and connection-check UI
├── options.js          # Ollama/model connectivity check
├── icons/              # Extension icons referenced by manifest.json
├── LICENSE             # MIT License
└── README.md           # Project documentation
```

## Configuration

The current model and endpoint are set near the top of `service_worker.js`:

```javascript
const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "qwen2.5:3b-instruct";
```

The settings-page connection check in `options.js` also expects the model name `qwen2.5:3b-instruct`. If you change the model, update both locations so the analysis and connection check remain consistent. The extension does not currently provide a UI control for changing the model.

## Privacy and data handling

- **Claim analysis:** The claim text is sent to the Ollama API running on your own computer at `localhost`.
- **No cloud AI key:** The current implementation does not call the previously described Hugging Face/DeepSeek API and does not require a cloud AI API key.
- **External verification:** The generated Google, Bing, and fact-checking links include the claim or a shortened quoted version of it in the URL. Opening one of these links sends the query to that external website according to its own policies.
- **Browser permissions:** The extension declares `activeTab`, `scripting`, `storage`, and `contextMenus` permissions and allows connection to `http://localhost:11434/*`. The current supplied code does not store a user API key.

Review the source code and browser permission prompts before installing any extension.

## Troubleshooting

**“Could not connect to Ollama”**

- Confirm Ollama is installed and running.
- Open `http://localhost:11434/api/tags` in your browser or use the settings page's connection check.
- Confirm the extension is configured for `http://localhost:11434` and that local security software is not blocking the connection.

**“The expected model was not found”**

Run:

```bash
ollama pull qwen2.5:3b-instruct
```

Then retry the connection check.

**The popup shows an AI error or no response**

- Confirm the Ollama service is still running.
- Check that the model is available with `ollama list`.
- Open `chrome://extensions/`, find TruthLens, and inspect its service worker or extension errors for additional details.

**Right-click analysis does not show a toast**

- Test on a normal HTTP or HTTPS webpage rather than a browser-internal page.
- Reload the webpage after installing or reloading the extension.
- Open the extension details and inspect errors if the problem continues.

## Limitations and responsible use

- The model's assessment is based on its generated response and existing model knowledge; the extension does not automatically verify claims against live web content.
- Search links are provided for manual investigation. They are not proof that a claim is true or false.
- Results can be incomplete, outdated, or incorrect. For consequential claims, consult original documents, reputable reporting, and relevant subject-matter experts.
- The popup displays the active tab's domain for context, but the current implementation does not automatically extract and analyze the webpage's full contents.

## Contributing

Contributions are welcome. Useful areas include improving the interface, strengthening error handling, adding verification sources, improving accessibility, and refining the analysis prompt.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes locally.
4. Open a pull request describing the change.

## License

This project is distributed under the MIT License. See [`LICENSE`](LICENSE) for the full text.
