
const checkButton = document.getElementById("check");
const statusElement = document.getElementById("status");

checkButton.addEventListener("click", async () => {
  checkButton.disabled = true;
  statusElement.textContent = "Checking Ollama...";

  try {
    const response = await fetch(
      "http://localhost:11434/api/tags"
    );

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const models = Array.isArray(data.models)
      ? data.models
      : [];

    const installed = models.some(
      model => model.name === "qwen2.5:3b-instruct"
    );

    if (installed) {
      statusElement.textContent =
        "Connected successfully.\n" +
        "qwen2.5:3b-instruct is installed.";
    } else {
      statusElement.textContent =
        "Ollama is running, but the expected model was not found.\n" +
        "Run: ollama pull qwen2.5:3b-instruct";
    }
  } catch (error) {
    statusElement.textContent =
      "Could not connect to Ollama.\n" +
      "Make sure Ollama is running on this computer.\n\n" +
      "Details: " + error.message;
  } finally {
    checkButton.disabled = false;
  }
});
