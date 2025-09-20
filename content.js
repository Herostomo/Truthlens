  // Simple toast UI
  function toast(html) {
    const t = document.createElement('div');
    t.innerHTML = html;
    Object.assign(t.style, {
      position: 'fixed',
      right: '10px',
      bottom: '10px',
      background: '#111',
      color: '#fff',
      padding: '12px 14px',
      borderRadius: '10px',
      zIndex: 999999,
      maxWidth: '360px',
      fontSize: '13px',
      lineHeight: '1.4',
      boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 7000);
  }

  // Listen for AI results from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "AI_RESULT") {
      const r = msg.result;
      if (!r.ok) {
        toast(`<b>TruthLens AI</b><br>Error: ${r.error}`);
        return;
      }

      const { deepSeekOutput, tips } = r;

      const formattedOutput = deepSeekOutput
        .replace(/(?:\r\n|\r|\n)/g, '<br>')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const linkHtml = tips.slice(0, 3)
        .map(u => `<a style="color:#7fd2ff" href="${u}" target="_blank">Verify</a>`)
        .join(" · ");

      toast(
        `<b>TruthLens AI</b><br>` +
        `<div style="margin-top:6px">${formattedOutput}</div>` +
        `<div style="margin-top:6px">${linkHtml}</div>`
      );
    }
  });
