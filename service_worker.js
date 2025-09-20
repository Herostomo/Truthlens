// Context menu for AI verify
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "aiVerifySelection",
    title: "TruthLens: AI verify selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "aiVerifySelection" && info.selectionText) {
    const result = await aiAnalyzeText(info.selectionText);
    chrome.tabs.sendMessage(tab.id, { type: "AI_RESULT", input: info.selectionText, result });
  }
});

// ==== Hugging Face DeepSeek Chat API helper ====
async function getKey() {
  // ⚠️ For testing only — use chrome.storage.sync in production
  return [your hugging face api key];
}

async function deepSeekAPI(text) {
  const key = await getKey();
  if (!key) throw new Error("Missing Hugging Face API key.");

  const payload = {
    model: "deepseek-ai/DeepSeek-V3.1",
    messages: [
      { role: "user", content: `Analyze the following text and determine if it contains misinformation. Provide a yes/no answer with a brief explanation:\n\n"${text}"` }
    ],
    max_tokens: 512
  };

  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`HF error ${res.status}: ${t}`);
  }

  return res.json();
}

// Main AI analyze using DeepSeek
async function aiAnalyzeText(text) {
  try {
    const result = await deepSeekAPI(text);

    const outputText = result.choices?.[0]?.message?.content || JSON.stringify(result);

    return {
      ok: true,
      deepSeekOutput: outputText,
      tips: buildQueries(text)
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Build fact-check search links
function buildQueries(sentence){
  const quoted = `"${sentence.replace(/\s+/g,' ').trim().slice(0,180)}"`;
  const base = [
    `https://www.google.com/search?q=${encodeURIComponent(quoted + " fact check")}`,
    `https://www.bing.com/search?q=${encodeURIComponent(quoted + " fact check")}`
  ];
  const factSites = [
    "https://www.snopes.com/search/?q=",
    "https://www.politifact.com/search/?q=",
    "https://www.altnews.in/?s=",
    "https://www.boomlive.in/search?query=",
    "https://www.factly.in/?s="
  ];
  const q = encodeURIComponent(sentence);
  const bySites = factSites.map(u => u + q);
  return [...base, ...bySites].slice(0, 10);
}

// Request handler from popup/content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AI_ANALYZE") {
    aiAnalyzeText(msg.text).then(sendResponse);
    return true; // async
  }
});

