async function getActiveTab(){ const [t] = await chrome.tabs.query({active:true,currentWindow:true}); return t; }

document.getElementById('aiBtn').onclick = async () => {
  const text = document.getElementById('aiText').value.trim();
  const out = document.getElementById('aiOut');
  if(!text){ out.textContent = "Enter some text first."; return; }
  out.textContent = "Analyzing…";
  chrome.runtime.sendMessage({ type: "AI_ANALYZE", text }, (resp)=>{
    if(!resp){ out.textContent = "No response."; return; }
    if(!resp.ok){ out.textContent = "AI error: " + resp.error; return; }
    const { deepSeekOutput, tips } = resp;
    out.innerHTML =
      `<b>AI Analysis:</b><br>${deepSeekOutput.replace(/\n/g,'<br>')}<br><br>` +
      (tips?.map(t=>`• <a href="${t}" target="_blank">Open</a>`).join("<br>") || '');
  });
};

// show current domain
(async ()=>{
  const tab = await getActiveTab();
  const url = new URL(tab.url);
  document.getElementById("domain").textContent = url.hostname;
})();
