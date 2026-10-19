
/*
 * TruthLens - Chrome Extension Background Service Worker
 * Local AI: Ollama + qwen2.5:3b-instruct
 * No cloud API key required.
 */

// =========================================================
// Configuration
// =========================================================

const OLLAMA_URL = "http://localhost:11434/api/chat";
const OLLAMA_MODEL = "qwen2.5:3b-instruct";

// =========================================================
// Context menu: AI verification of selected text
// =========================================================

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    if (chrome.runtime.lastError) {
      console.error(
        "Failed to clear context menus:",
        chrome.runtime.lastError.message
      );
      return;
    }

    chrome.contextMenus.create(
      {
        id: "aiVerifySelection",
        title: "TruthLens: AI verify selection",
        contexts: ["selection"]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Failed to create context menu:",
            chrome.runtime.lastError.message
          );
        }
      }
    );
  });
});

// Handle right-click context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    info.menuItemId !== "aiVerifySelection" ||
    !info.selectionText ||
    tab?.id == null
  ) {
    return;
  }

  const result = await aiAnalyzeText(info.selectionText);

  chrome.tabs.sendMessage(
    tab.id,
    {
      type: "AI_RESULT",
      input: info.selectionText,
      result
    },
    () => {
      // Some restricted pages do not allow content scripts.
      void chrome.runtime.lastError;
    }
  );
});

// =========================================================
// Ollama API: run the local Qwen model
// =========================================================

async function deepSeekAPI(text) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        {
          role: "system",
          content: `You are TruthLens, an assistant that helps users
evaluate potentially misleading claims.

Analyze the claim carefully and give a concise assessment.

Explain whether the claim appears supported, contradicted,
or uncertain based on your existing knowledge.

Do not invent evidence, citations, dates, statistics, or sources.
Do not claim to have searched the internet or verified sources
when you have not actually done so.

Distinguish established facts from assumptions.
Explain what evidence would be needed to verify the claim.
If you lack sufficient information, explicitly say so.

Use this response structure:

Assessment: Supported / Contradicted / Uncertain
Explanation: Brief reasoning
Evidence needed: What should be checked

Your response is a preliminary assessment, not a definitive
fact-check.`
        },
        {
          role: "user",
          content: `Analyze this claim:\n\n${text}`
        }
      ],
      options: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Ollama error ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();
  const outputText = data.message?.content;

  if (!outputText) {
    throw new Error("Ollama returned an empty response.");
  }

  // Preserve the response structure expected by aiAnalyzeText().
  return {
    choices: [
      {
        message: {
          content: outputText
        }
      }
    ]
  };
}

// =========================================================
// Main AI analysis function
// =========================================================

async function aiAnalyzeText(text) {
  try {
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Please provide text to analyze.");
    }

    const result = await deepSeekAPI(text.trim());

    const outputText =
      result.choices?.[0]?.message?.content ||
      "The model returned no analysis.";

    return {
      ok: true,
      deepSeekOutput: outputText,
      tips: buildQueries(text)
    };
  } catch (error) {
    console.error("TruthLens analysis failed:", error);

    return {
      ok: false,
      error: error.message || "An unexpected error occurred."
    };
  }
}

// =========================================================
// Build fact-check search links
// =========================================================

function buildQueries(sentence) {
  const normalized = sentence.replace(/\s+/g, " ").trim();

  // Limit the quoted search phrase to a manageable length.
  const quoted = `"${normalized.slice(0, 180)}"`;
  const searchQuery = encodeURIComponent(
    `${quoted} fact check`
  );

  const base = [
    `https://www.google.com/search?q=${searchQuery}`,
    `https://www.bing.com/search?q=${searchQuery}`
  ];

  const q = encodeURIComponent(normalized);

  const factSites = [
    `https://www.snopes.com/search/?q=${q}`,
    `https://www.politifact.com/search/?q=${q}`,
    `https://www.altnews.in/?s=${q}`,
    `https://www.boomlive.in/search?query=${q}`,
    `https://www.factly.in/?s=${q}`
  ];

  return [...base, ...factSites];
}

// =========================================================
// Message handler for popup.js
// =========================================================

chrome.runtime.onMessage.addListener(
  (msg, sender, sendResponse) => {
    if (msg?.type !== "AI_ANALYZE") {
      return;
    }

    aiAnalyzeText(msg.text)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          ok: false,
          error: error.message || "Analysis failed."
        });
      });

    // Keep the message channel open for the async response.
    return true;
  }
);
