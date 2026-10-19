
/*
 * TruthLens - Popup Script
 * Uses the local Ollama model through service_worker.js.
 * No cloud API key required.
 */

// Get the active browser tab
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  return tab;
}

// Get popup elements
const aiBtn = document.getElementById("aiBtn");
const aiText = document.getElementById("aiText");
const aiOut = document.getElementById("aiOut");

// =========================================================
// AI analysis button
// =========================================================

aiBtn.addEventListener("click", async () => {
  const text = aiText.value.trim();

  // Clear previous output
  aiOut.replaceChildren();

  if (!text) {
    aiOut.textContent = "Enter some text first.";
    return;
  }

  // Prevent repeated clicks while analyzing
  aiBtn.disabled = true;
  aiBtn.textContent = "Analyzing...";
  aiOut.textContent = "Analyzing with your local Qwen model...";

  try {
    const response = await chrome.runtime.sendMessage({
      type: "AI_ANALYZE",
      text
    });

    if (!response) {
      aiOut.textContent =
        "No response from the background service worker.";
      return;
    }

    if (!response.ok) {
      aiOut.textContent = "AI error: " + response.error;
      return;
    }

    // Render the AI response as plain text.
    // Do not insert model output using innerHTML.
    aiOut.replaceChildren();

    const heading = document.createElement("strong");
    heading.textContent = "AI Analysis:";

    const result = document.createElement("div");
    result.style.whiteSpace = "pre-wrap";
    result.style.overflowWrap = "anywhere";
    result.textContent =
      response.deepSeekOutput || "No analysis returned.";

    aiOut.append(
      heading,
      document.createElement("br"),
      result,
      document.createElement("br"),
      document.createElement("br")
    );

    // Render verification links.
    const tips = Array.isArray(response.tips)
      ? response.tips
      : [];

    if (tips.length > 0) {
      const linksHeading = document.createElement("strong");
      linksHeading.textContent = "Verify independently:";
      aiOut.append(linksHeading, document.createElement("br"));
    }

    for (const url of tips) {
      try {
        const parsed = new URL(url);

        // Only allow HTTPS links to the expected search providers.
        const allowedHosts = [
          "www.google.com",
          "www.bing.com",
          "www.snopes.com",
          "www.politifact.com",
          "www.altnews.in",
          "www.boomlive.in",
          "www.factly.in"
        ];

        if (
          parsed.protocol !== "https:" ||
          !allowedHosts.includes(parsed.hostname)
        ) {
          continue;
        }

        const link = document.createElement("a");
        link.href = parsed.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = `Open ${parsed.hostname}`;

        aiOut.append(
          link,
          document.createElement("br")
        );
      } catch {
        // Ignore malformed URLs.
      }
    }
  } catch (error) {
    aiOut.textContent =
      "Extension error: " +
      (error.message || "Could not contact the background service worker.");
  } finally {
    aiBtn.disabled = false;
    aiBtn.textContent = "AI Analyze";
  }
});

// =========================================================
// Display the current tab's domain
// =========================================================

(async () => {
  const domain = document.getElementById("domain");

  if (!domain) return;

  try {
    const tab = await getActiveTab();

    domain.textContent = tab?.url
      ? new URL(tab.url).hostname
      : "Current tab unavailable";
  } catch {
    domain.textContent = "Current tab unavailable";
  }
})();
