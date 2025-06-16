console.log("🍃 content.js loaded");

// retrieving the data from json file
fetch(chrome.runtime.getURL("csvjson.json"))
  .then((res) => res.json())
  .then((data) => {
  //tbd with logic later
    const brand = "Nike";
    const entry = data.find(
      (item) => item["Shop Name"].toLowerCase() === brand.toLowerCase()
    );

    if (!entry) {
      console.warn(`No sustainability data found for brand: ${brand}`);
      return;
    }

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

      document.getElementById("closeBtn").onclick = () => {
        panel.remove();
      };
    };
  });
