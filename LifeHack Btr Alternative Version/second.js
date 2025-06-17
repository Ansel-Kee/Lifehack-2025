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

function filterAlternative(entry, csvData) {
    const category = entry.Category;

    const sameCategoryCompany = csvData.filter(row =>
        row.Category.toLowerCase() === category.toLowerCase()
    );

    const filteredCompanies = sameCategoryCompany.filter(row =>
        row["Shop Name"] !== entry["Shop Name"]
    );

    return filteredCompanies;
}

function scoreComparison(filteredCompanies, entry) {
    const betterCompanies = [];

    const metrics = [
        { key: 'CO2 Emitted (tons/year)', weight: 0.2 },
        { key: 'Water Usage (million liters/year)', weight: 0.2 },
        { key: 'Electricity Usage (GWh/year)', weight: 0.2 },
        { key: 'Waste Generated (tons/year)', weight: 0.2 }
    ];

    for (let i = 0; i < filteredCompanies.length; i++) {
        const company = filteredCompanies[i];
        let totalWeightedScore = 0;
        let valid = true;

        for (let j = 0; j < metrics.length; j++) {
            const key = metrics[j].key;
            const weight = metrics[j].weight;

            const entryVal = parseFloat(entry[key]);
            const companyVal = parseFloat(company[key]);

            if (isNaN(entryVal) || isNaN(companyVal)) {
                valid = false;
                break;
            }

            const diff = (entryVal - companyVal) / entryVal;
            totalWeightedScore += diff * weight;
        }

        // ISO Certification Comparison
        let isoScore = 0;
        if (company['ISO Certified'] !== entry['ISO Certified']) {
            if (company['ISO Certified'] === "Yes") {
                isoScore = 1 * 0.2; // full weight if better
            }
        }
        totalWeightedScore += isoScore;

        if (valid && totalWeightedScore > 0) {
            betterCompanies.push({
                "Shop Name": company["Shop Name"],
                "Score": totalWeightedScore.toFixed(4),
                "CO2 Emitted (tons/year)": company["CO2 Emitted (tons/year)"],
                "Water Usage (million liters/year)": company["Water Usage (million liters/year)"],
                "Electricity Usage (GWh/year)": company["Electricity Usage (GWh/year)"],
                "Waste Generated (tons/year)": company["Waste Generated (tons/year)"],
                "Domain": "google.com"
            });
        }
    }

    return betterCompanies;
}
