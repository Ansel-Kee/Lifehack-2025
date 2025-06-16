
console.log("Popup loaded");

document.getElementById("leafBtn").addEventListener("click", () => {
  const panel = document.getElementById("reportPanel");
  panel.classList.toggle("hidden");
});
