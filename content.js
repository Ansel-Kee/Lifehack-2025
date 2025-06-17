
const weights = {
  CO2: 0.4,
  Water: 0.2,
  Electricity: 0.2,
  Waste: 0.1,
  ISO: 0.1
};

(async () => {
  const data = await fetch(chrome.runtime.getURL("data.json")).then(res => res.json());
  console.log("json loaded");

  const shop = await detectBrandFromPage();
  if (!shop) {
    console.warn("❌ No shop found");
    return;
  }

  const entry = findBrandData(shop, data);
  if (!entry) {
    console.warn(`❌ No sustainability data found for brand: ${shop}`);
    return;
  }

  function getBasePanelStyles() {
    return {
      position: "fixed",
      top: "180px",
      right: "20px",
      background: "#f9fff6",
      padding: "16px",
      borderLeft: "5px solid #74c67a",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      borderRadius: "12px",
      maxWidth: "280px",
      zIndex: "9999",
      fontFamily: "Segoe UI, sans-serif",
      overflowY: "auto",
      maxHeight: "400px",
    };
  }

  console.log("✅ Found entry:", entry);

const leafBtn = document.createElement("img");
leafBtn.src = chrome.runtime.getURL("images/ecootter.png");
leafBtn.alt = "Eco Otter Button";
leafBtn.title = "View Sustainability Info";

Object.assign(leafBtn.style, {
  position: "fixed",
  top: "100px",
  right: "20px",
  zIndex: "9999",
  width: "100px",        
  height: "100px",
  cursor: "pointer"
});


  leafBtn.title = "View Sustainability Info";
  document.body.appendChild(leafBtn);

  leafBtn.onclick = () => {
    if (document.getElementById("reportPanel")) return;

    const panel = document.createElement("div");
    panel.id = "reportPanel";
    Object.assign(panel.style, getBasePanelStyles());

    const scoredData = data.map(b => ({
      name: b["Shop Name"],
      score: computeEcoScore(b, data)
    }));
    function alt() {
      let altCompanies = filterAlternative(entry, data);
      let companies = scoreComparison(altCompanies, entry, data);
      panel.innerHTML = `
        <style>
          .altdiv {
            max-height: 280px;
            overflow-y: auto;
            padding-right: 5px;
          }

          .alt-card {
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }

          .alt-card h3 {
            margin: 0;
            font-size: 18px;
            color: #2e7d32;
          }

          .alt-card div {
            margin-top: 4px;
          }

          .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }

          .header-bar button {
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            color: #666;
          }
        </style>

        <div class="header-bar">
          <button id="backBtn">← Back</button>
          <button id="closeBtn">❌</button>
        </div>

        <div class="altdiv" id="alts"></div>
      `;
      Object.assign(panel.style, getBasePanelStyles());

      var list = document.getElementById("alts");
        companies.forEach((company) => {
          const ecoScore = computeEcoScore(company, data);
          company["ecoScore"] = ecoScore;
        })

      companies = companies.sort((a, b) => parseFloat(b.ecoScore) - parseFloat(a.ecoScore));
      companies.forEach((company) => {
        const starCount = Math.round(company["ecoScore"] / 10); // 5-star scale
        const stars = "⭐️".repeat(starCount) + "☆".repeat(10 - starCount);

        const card = document.createElement("div");
        card.style.marginBottom = "15px";
        card.style.borderBottom = "1px solid #ccc";
        card.style.paddingBottom = "10px";
        card.innerHTML = `
        <h3 style="margin:0; font-size:18px; color:#2e7d32;"><a href=https://${company["URL"]}>${company["Shop Name"]}</a></h3>
        <div><strong>EcoScore: ${company["ecoScore"]}/100</strong><br/>${stars}</div>
        <div><img src="${chrome.runtime.getURL("images/co2.png")}" style="height:18px;"> CO₂: ${company["CO2"]} Kg/Unit</div>
        <div><img src="${chrome.runtime.getURL("images/water.png")}" style="height:18px;"> Water: ${company["Water"]} L/Unit</div>
        <div><img src="${chrome.runtime.getURL("images/electricity.png")}" style="height:18px;"> Electricity: ${company["Electricity"]} Wh/Unit</div>
        <div><img src="${chrome.runtime.getURL("images/waste.png")}" style="height:18px;"> Waste: ${company["Waste"]} Kg/Unit</div>
        <div><img src="${chrome.runtime.getURL("images/iso.png")}" style="height:18px;"> ISO Certified: ${company["ISO Certified"]}</div>
      `;
        list.appendChild(card);
      });

      document.getElementById("backBtn").onclick = () => {
        panel.innerHTML = companyInfo;
        document.getElementById("closeBtn").onclick = () => panel.remove();
        document.getElementById("altBtn").onclick = () => alt();

      }
      document.getElementById("closeBtn").onclick = () => panel.remove();
    };
    const sorted = scoredData.sort((a, b) => b.score - a.score);
    const ecoScore = computeEcoScore(entry, data);
    const rank = sorted.findIndex(b => b.name.toLowerCase() === entry["Shop Name"].toLowerCase()) + 1;
    const total = sorted.length;
    const averageScore = Math.round(sorted.reduce((acc, b) => acc + b.score, 0) / total);
    const starCount = Math.round(ecoScore / 10); // 5-star scale
    const stars = "⭐️".repeat(starCount) + "☆".repeat(10 - starCount);

    let companyInfo = `
      <style>
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reportPanel{
        max-height:300px
        }
      </style>
      <button id="closeBtn" style="
        position:absolute; top:8px; right:10px; border:none; background:none;
        font-size:16px; cursor:pointer; color:#666;">❌</button>

      <h3 style="margin-top:0; font-size:18px; color:#2e7d32;"><a href=${entry["URL"]}>${entry["Shop Name"]}</a></h3>
      <p style="margin-bottom:12px;"><em>${entry["Category"]}</em></p>

      <div style="margin:15px; line-height:1.8;">
      <div><strong>EcoScore: ${ecoScore}/100</strong> <br/>${stars}</div>
      <div><strong>Ranking:</strong> #${rank} of ${total}</div>
      <div><strong>Average Score:</strong> ${averageScore}/100</div>
      <div><img src="${chrome.runtime.getURL("images/co2.png")}" style="height:18px; vertical-align:middle;"> CO₂: ${entry["CO2"]} Kg/Unit</div>
      <div><img src="${chrome.runtime.getURL("images/water.png")}" style="height:18px; vertical-align:middle;"> Water: ${entry["Water"]} L/Unit</div>
      <div><img src="${chrome.runtime.getURL("images/electricity.png")}" style="height:18px; vertical-align:middle;"> Electricity: ${entry["Electricity"]} Wh/Unit</div>
      <div><img src="${chrome.runtime.getURL("images/waste.png")}" style="height:18px; vertical-align:middle;"> Waste: ${entry["Waste"]} Kg/Unit</div>
      <div><img src="${chrome.runtime.getURL("images/iso.png")}" style="height:18px; vertical-align:middle;"> ISO Certified: ${entry["ISO Certified"]}</div>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button id="altBtn" style="
        flex: 1;
        padding: 6px 10px;
        border-radius: 6px;
        background-color: #e0f2f1;
        border: none;
        font-size: 14px;
        cursor: pointer;
        color: #00796b;
        font-weight: 600;
      ">🌿 Alternatives</button>

            <button id="greenwashBtn" style="
            flex: 1;
        padding: 6px 10px;
        border-radius: 6px;
        background-color: #fff3e0;
        border: none;
        font-size: 14px;
        cursor: pointer;
        color: #ef6c00;
        font-weight: 600;  
        ">🧪 Greenwashing</button>
        </div>
        `;


    panel.innerHTML = companyInfo
    document.body.appendChild(panel);
    document.getElementById("closeBtn").onclick = () => panel.remove();
    document.getElementById("altBtn").onclick = () => alt();

    document.getElementById("greenwashBtn").onclick = () => {
      const existing = document.getElementById("greenwashReport");
      if (existing) {
        existing.remove();
        return;
      }

      const resultsPanel = document.createElement("div");
      resultsPanel.id = "greenwashReport";
      resultsPanel.style.marginTop = "10px";
      resultsPanel.style.maxHeight = "200px";
      resultsPanel.style.overflowY = "auto";

      const hasFindings = findings.length > 0;
      resultsPanel.innerHTML = `
    <div style="
      margin-bottom:10px; padding:8px 10px; border-radius:6px;
      background-color: ${hasFindings ? "#fff3e0" : "#e8f5e9"};
      border-left: 4px solid ${hasFindings ? "#ef6c00" : "#4CAF50"};
      font-weight: bold;
      color: ${hasFindings ? "#ef6c00" : "#2e7d32"};
    ">
      ${hasFindings
          ? "⚠️ Greenwashing patterns found:"
          : "✅ No greenwashing patterns detected."}
    </div>
    <ul style="list-style:none; padding:0;"></ul>
  `;

      const ul = resultsPanel.querySelector("ul");
      findings.forEach(({ category, description, hits, severity }) => {
        const li = document.createElement("li");
        li.style.marginBottom = "10px";
        li.style.fontSize = "14px";
        li.style.color = severity === "issue" ? "#c62828" :
          severity === "warning" ? "#ef6c00" : "#2e7d32";
        li.innerHTML = `
      <strong>${category}</strong><br>
      <em style="font-size:12px">${description}</em><br>
      Keywords: ${hits.join(", ")}
    `;
        ul.appendChild(li);
      });

      panel.appendChild(resultsPanel);
    };


  };
})();

async function detectBrandFromPage() {
  let url = window.location.host;
  if (url.includes("www")) url = url.slice(url.indexOf(".") + 1);

  if (url === "shopee.sg") {
    const el = await waitForElement(".fV3TIn");
    return el.textContent.trim();

  } else if (url === "lazada.sg") {
    let el;
    try {
      el = await waitForElement(".seller-name__detail");
    } catch {
      try {
        el = await waitForElement(".pdp-product-brand-v2__brand-link");
      } catch {
        console.warn("Lazada brand element not found");
        return null;
      }
    }
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

function findBrandData(shop, data) {
  const cleanedShop = shop.toLowerCase().replace(/[\W_]+/g, "");
  return data.find(row =>
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

function filterAlternative(entry, csvData) {
  const categories = entry.Category;
  const sameCategoryCompany = [];
  csvData.forEach(row => {
    for (let i = 0; i < row.Category.length; i++) {
      if (categories.includes(row.Category[i]) && row["Shop Name"] !== entry["Shop Name"]) {
        sameCategoryCompany.push(row);
        break;
      }
    }
  });

  return sameCategoryCompany;
}
function normalise(value, min, max) {
  return 1 - (value - min) / (max - min); // lower is better
}
function getMinMax(key, data) {
  const values = data.map(b => parseFloat(b[key]));
  return { min: Math.min(...values), max: Math.max(...values) };
}

// === SCORE CALCULATION ===
function computeEcoScore(entry, data) {
  const keys = ["CO2", "Water", "Electricity", "Waste"];
  let score = 0;

  for (const key of keys) {
    const { min, max } = getMinMax(key, data);
    const raw = parseFloat(entry[key]);
    const norm = normalise(raw, min, max);
    score += weights[key] * norm;
  }

  const isoScore = (entry["ISO Certified"]?.toLowerCase() === "yes") ? 1 : 0;
  score += weights.ISO * isoScore;

  return Math.round(score * 100);
}

function scoreComparison(filteredCompanies, entry, data) {
  const betterCompanies = [];
  const entryScore = computeEcoScore(entry, data)

  for (let i = 0; i < filteredCompanies.length; i++) {
    const company = filteredCompanies[i];
    let companyScore = computeEcoScore(company, data);
    if (companyScore >= entryScore) {
      betterCompanies.push(company);
    }
  }

  return betterCompanies;
}

// 1) patterns stay the same:
const patterns = [
  {
    category: "Quantitative recycled-content",
    description: "percentages like “X% recycled” that claim a concrete amount.",
    severity: "issue",
    regex: /\b\d+\s*%\s*recycled\b/gi
  },
  {
    category: "Partial-component call-outs",
    description: "Highlighting only one part (e.g. lining or insole) as recycled while ignoring the rest.",
    severity: "warning",
    regex: /\b(?:vamp|collar|tongue|lining|insole)\b.*\b(recycled)\b/gi
  },
  {
    category: "Unspecified Quantity Claims",
    description: "Vague terms that don’t commit to a precise number (e.g. “up to”, “almost”).",
    severity: "warning",
    regex: /\b(?:at least|up to|approximately|around|nearly|over|under|more than|less than|only|just)\b/gi
  },
  {
    category: "Vague sustainability keywords",
    description: "keywords without hard data (e.g. “slow fashion,” “upcycled”).",
    severity: "issue",
    regex: /\b(?:eco[-\s]?friendly|sustainable|natural|naturel|planet[-\s]?positive|future[-\s]?friendly|environmentally[-\s]?sound|eco[-\s]?conscious|environmentally responsible|eco[-\s]?innovation|slow[-\s]?fashion|organic\s+cotton|plant[-\s]?based\s+dyes?|fair[-\s]?trade|upcycled|cruelty[-\s]?free\s+leather|regenerative\s+agriculture|traceable\s+supply\s+chain|zero[-\s]?discharge|waterless\s+dyeing|non[-\s]?mulesed\s+wool|closed[-\s]?loop|low[-\s]?impact\s+fabric|recyclable\s+packaging)\b/gi
  }
];

// 2) Build findings
const text = document.body.innerText;
const findings = patterns
  .map(({ category, description, severity, regex }) => {
    const matches = text.match(regex);
    return matches
      ? { category, description, severity, hits: [...new Set(matches)] }
      : null;
  })
  .filter(Boolean);

// 3) Safe highlighting via TreeWalker
function highlightText(term, className) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
  const toWrap = [];

  let node;
  while (node = walker.nextNode()) {
    if (regex.test(node.nodeValue)) {
      toWrap.push(node);
    }
  }

  toWrap.forEach(textNode => {
    const frag = document.createDocumentFragment();
    let last = 0;
    textNode.nodeValue.replace(regex, (match, offset) => {
      frag.appendChild(document.createTextNode(textNode.nodeValue.slice(last, offset)));
      const mark = document.createElement('mark');
      mark.className = className;
      mark.textContent = match;
      frag.appendChild(mark);
      last = offset + match.length;
    });
    frag.appendChild(document.createTextNode(textNode.nodeValue.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

findings.forEach(({ hits, severity }) => {
  hits.forEach(term => highlightText(term, `gw-${severity}`));
});

// 4) Messaging for popup.js (unchanged)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "REQUEST_FINDINGS") {
    sendResponse({ findings });
  }
});
