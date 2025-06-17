const entry = window.sustainabilityEntry; //Get it from content.js

if (!entry) {
  console.warn("No entry found in window.sustainabilityEntry");
} else {
    
  const alternatives = filterAlternative(entry, csvData);
  window.betterOptions = scoreComparison(alternatives, entry);
  console.log("Better options:", window.betterOptions);
  console.log(betterOptions);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getBetterOptions") {
    sendResponse({ data: window.betterOptions });
  }
});


