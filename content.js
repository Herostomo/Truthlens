
/*
 * TruthLens - Content Script
 * Displays results from the local Qwen model.
 */

function showToast(result) {
  const toast = document.createElement("div");

  Object.assign(toast.style, {
    position: "fixed",
    right: "10px",
    bottom: "10px",
    background: "#111",
    color: "#fff",
    padding: "12px 14px",
    borderRadius: "10px",
    zIndex: "2147483647",
    maxWidth: "360px",
    maxHeight: "70vh",
    overflowY: "auto",
    fontSize: "13px",
    lineHeight: "1.5",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
    whiteSpace: "pre-wrap"
  });

  const heading = document.createElement("strong");
  heading.textContent = "TruthLens AI";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "Close";

  Object.assign(closeButton.style, {
    float: "right",
    marginLeft: "12px",
    cursor: "pointer"
  });

  closeButton.addEventListener("click", () => toast.remove());

  toast.append(
    heading,
    closeButton,
    document.createElement("br")
  );

  if (!result?.ok) {
    const error = document.createElement("div");
    error.textContent =
      "Error: " + (result?.error || "Unknown error");

    toast.append(error);
  } else {
    const output = document.createElement("div");
    output.style.marginTop = "6px";
    output.textContent =
      result.deepSeekOutput || "No analysis returned.";

    toast.append(output);

    const links = document.createElement("div");
    links.style.marginTop = "8px";

    const allowedHosts = [
      "www.google.com",
      "www.bing.com",
      "www.snopes.com",
      "www.politifact.com",
      "www.altnews.in",
      "www.boomlive.in",
      "www.factly.in"
    ];

    const tips = Array.isArray(result.tips)
      ? result.tips.slice(0, 3)
      : [];

    for (const url of tips) {
      try {
        const parsed = new URL(url);

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
        link.textContent = "Verify claim";

        link.style.color = "#7fd2ff";
        link.style.marginRight = "10px";

        links.append(link);
      } catch {
        // Ignore malformed URLs.
      }
    }

    toast.append(links);
  }

  document.body.append(toast);

  setTimeout(() => toast.remove(), 15000);
}

// Receive results from service_worker.js.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "AI_RESULT") {
    showToast(msg.result);
  }
});
