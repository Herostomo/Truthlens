const keyEl = document.getElementById('hfKey');
const statusEl = document.getElementById('status');

chrome.storage.sync.get(['hfKey'], ({ hfKey }) => {
  if (hfKey) keyEl.value = hfKey;
});

document.getElementById('save').onclick = () => {
  const hfKey = keyEl.value.trim();
  chrome.storage.sync.set({ hfKey }, () => {
    statusEl.textContent = "Saved!";
    setTimeout(()=> statusEl.textContent = "", 1200);
  });
};
