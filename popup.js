console.log("Popup loaded");

document.getElementById("leafBtn").addEventListener("click", () => {
  const panel = document.getElementById("reportPanel");
  panel.classList.toggle("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
  const statusEl  = document.getElementById("status");
  const resultsEl = document.getElementById("results");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) {
      statusEl.textContent = "Unable to find active tab.";
      statusEl.className = "issue";
      return;
    }

    chrome.tabs.sendMessage(
      tabId,
      { type: "REQUEST_FINDINGS" },
      (response) => {
        if (chrome.runtime.lastError) {
          statusEl.textContent = "No detector running on this page.";
          statusEl.className = "warning";
        } else if (response?.findings?.length) {
          statusEl.textContent = "Potential greenwashing patterns found:";
          statusEl.className = "issue";
          response.findings.forEach(({ category, description, hits, severity }) => {
            const li = document.createElement("li");
            li.className = severity;
            li.innerHTML = `
              <strong>${category}</strong><br>
              <em>${description}</em><br>
              keywords: ${hits.join(", ")}
            `;
            resultsEl.appendChild(li);
          });
        } else {
          statusEl.textContent = "No greenwashing patterns detected.";
          statusEl.className = "safe";
        }
      }
    );
  });
});
