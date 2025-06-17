console.log("Popup loaded");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("leafBtn").addEventListener("click", () => {
    // Ask content script for the better companies
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getBetterOptions" },
        (response) => {
          const companies = response?.data;
          if (companies && companies.length > 0) {
            displayCompanies(companies);
          } else {
            alert("No better alternatives found.");
          }
        }
      );
    });
  });
});

function displayCompanies(companies) {
  const panel = document.getElementById("reportPanel");
  panel.innerHTML = ""; // Clear previous content
  panel.classList.remove("hidden");

  companies.forEach((company) => {
    const block = document.createElement("div");
    block.innerHTML = `
      <h3>${company["Shop Name"]}</h3>
      <ul>
        <li>CO2 Emitted: <strong>${company["CO2 Emitted (tons/year)"]}</strong></li>
        <li>Water Usage: <strong>${company["Water Usage (million liters/year)"]}</strong></li>
        <li>Electricity Usage: <strong>${company["Electricity Usage (GWh/year)"]}</strong></li>
        <li>Waste Generated: <strong>${company["Waste Generated (tons/year)"]}</strong></li>
        <li>ISO Certified: <strong>Yes</strong></li>
      </ul>
    `;
    panel.appendChild(block);
  });
}
