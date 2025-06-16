// 1. Sample fake sustainability data (To be replaced by CSV File)
const sustainabilityData = [
    { "Shop Name": "Nike", "CO2": "1,200,000", "ISO Certified": "Yes" },
    { "Shop Name": "Adidas", "CO2": "950,000", "ISO Certified": "Yes" },
    { "Shop Name": "Zara", "CO2": "800,000", "ISO Certified": "No" }
];

// 2. Function to clean domain name
function cleanDomain(hostname) {
    let domain = hostname.replace(/^www\./, "");    
    domain = domain.split(".")[0];                    
    return domain.charAt(0).toUpperCase() + domain.slice(1).toLowerCase(); // Capitalize
}

// 3. Function to find brand match from the CSV dataset
function findBrandData(cleanedDomain, csvData) {
    return csvData.find(row => row["Shop Name"].toLowerCase() === cleanedDomain.toLowerCase());
}

// 4. Main logic: get current chrome tab, asynchronous call (to include tabs and activeTab to allow chrome.tabs to work)
chrome.tabs.query({active: true, currrentWindow: true}, function (tabs) {
    //return if no tabs found, which shouldnt be the case
    if (tabs.length === 0) return;
    
    //get current URL & Clean it
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    const cleaned = cleanDomain(hostname);
    
    //For Shopee, amazon or lazada which will have diff code else just return data normally
    if(cleaned["Shop Name"].toLowerCase() === "shopee"){
        //Insert Ansel Code
    }
    else{
        const found = findBrandData(cleaned, sustainabilityData);
        
        if(!found){
            console.log("Error");
            return;
        }
        else{
            console.log(found)
            //Insert Code to send to HTML 
        }
    }
})