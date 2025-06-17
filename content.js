console.log("🍃 content.js loaded");

(async () => {
  const data = await fetch(chrome.runtime.getURL("csvjson.json")).then(res => res.json());
  console.log("json loaded");

  const shop = await detectBrandFromPage(); // now async
  if (!shop) {
    console.warn("❌ No shop found");
    return;
  }

  const entry = findBrandData(shop, data);
  if (!entry) {
    console.warn(`❌ No sustainability data found for brand: ${shop}`);
    return;
  }

  console.log("✅ Found entry:", entry);

  const leafBtn = document.createElement("button");
  leafBtn.textContent = "🍃";
  Object.assign(leafBtn.style, {
    position: "fixed",
    top: "100px",
    right: "20px",
    zIndex: "9999",
    background: "#e6f4ea",
    color: "#4CAF50",
    border: "2px solid #4CAF50",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "20px",
    cursor: "pointer",
  });
  leafBtn.title = "View Sustainability Info";
  document.body.appendChild(leafBtn);

  leafBtn.onclick = () => {
    if (document.getElementById("reportPanel")) return;

    const panel = document.createElement("div");
    panel.id = "reportPanel";
    Object.assign(panel.style, {
      position: "fixed",
      top: "160px",
      right: "20px",
      background: "#f9fff6",
      padding: "16px",
      borderLeft: "5px solid #74c67a",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      borderRadius: "12px",
      maxWidth: "260px",
      zIndex: "9999",
      fontFamily: "Segoe UI, sans-serif",
      animation: "slideIn 0.4s ease-out",
    });

    panel.innerHTML = `
      <style>
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <button id="closeBtn" style="
        position:absolute; top:8px; right:10px; border:none; background:none;
        font-size:16px; cursor:pointer; color:#666;">❌</button>

      <h3 style="margin-top:0; font-size:18px; color:#2e7d32;">${entry["Shop Name"]}</h3>
      <p style="margin-bottom:12px;"><em>${entry["Category"]}</em></p>

      <ul style="list-style:none; padding:0; margin:0; line-height:1.8;">
        <li><img src="${chrome.runtime.getURL("images/co2.png")}" style="height:18px; vertical-align:middle;"> <strong>${entry["CO2 Emitted (tons/year)"]} tons/year</strong></li>
        <li><img src="${chrome.runtime.getURL("images/water.png")}" style="height:18px; vertical-align:middle;"> <strong>${entry["Water Usage (million liters/year)"]} million liters/year</strong></li>
        <li><img src="${chrome.runtime.getURL("images/electricity.png")}" style="height:18px; vertical-align:middle;"> <strong>${entry["Electricity Usage (GWh/year)"]} GWh/year</strong></li>
        <li><img src="${chrome.runtime.getURL("images/waste.png")}" style="height:18px; vertical-align:middle;"> <strong>${entry["Waste Generated (tons/year)"]} tons/year</strong></li>
        <li><img src="${chrome.runtime.getURL("images/iso.png")}" style="height:18px; vertical-align:middle;"> <strong>ISO Certified: ${entry["ISO Certified"]}</strong></li>
      </ul>
    `;

    document.body.appendChild(panel);
    document.getElementById("closeBtn").onclick = () => panel.remove();
  };
})();

async function detectBrandFromPage() {
  let url = window.location.host;
  if (url.includes("www")) {
    url = url.slice(url.indexOf(".") + 1);
  }

  if (url === "shopee.sg") {
    const el = await waitForElement(".fV3TIn");
    return el.textContent.trim();
  } else if (url === "lazada.sg") {
    const el = await waitForElement(".seller-name__detail");
    return el.textContent.trim();
  } else if (url === "amazon.sg") {
    const el = await waitForElement("#bylineInfo");
    const byline = el.textContent.trim();
    if (byline.includes("Visit the ")) {
      return byline.slice(10, byline.indexOf(" Store"));
    } else if (byline.includes("Brand: ")) {
      return byline.slice(7);
    }
  } else {
    return url.slice(0, url.indexOf("."));
  }

  return null;
}

function findBrandData(shop, csvData) {
  const cleanedShop = shop.toLowerCase().replace(/[\W_]+/g, "");
  return csvData.find(row =>
    cleanedShop.includes(row["Shop Name"].toLowerCase().replace(/[\W_]+/g, ""))
  );
}

function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timed out waiting for ${selector}`));
    }, timeout);
  });
}
