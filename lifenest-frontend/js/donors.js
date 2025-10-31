// 🩸 Load all donors and display in the table
async function loadDonations() {
  const tbody = document.querySelector("#donorsTable tbody");
  const refreshBtn = document.getElementById("refreshBtn");

  // Temporary loading message
  tbody.innerHTML = "<tr><td colspan='3'>⏳ Loading donors...</td></tr>";

  // Disable refresh button during fetch
  refreshBtn.disabled = true;
  refreshBtn.style.opacity = "0.7";
  refreshBtn.textContent = "Loading...";

  try {
    // Fetch donor data from backend
    const response = await fetch("http://localhost:5000/api/blood/donations");
    const donors = await response.json();

    // If no donors found
    if (!donors.length) {
      tbody.innerHTML = "<tr><td colspan='3'>No donors found.</td></tr>";
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = "1";
      refreshBtn.textContent = "🔄 Refresh Now";
      return;
    }

    // Clear old rows
    tbody.innerHTML = "";

    // Populate donor rows
    donors.forEach(d => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.name}</td>
        <td><span class="blood-badge">${d.blood_type}</span></td>
        <td>${d.area}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading donors:", err);
    tbody.innerHTML = "<tr><td colspan='3'>⚠️ Error loading donors.</td></tr>";
  } finally {
    // Re-enable button after fetch
    refreshBtn.disabled = false;
    refreshBtn.style.opacity = "1";
    refreshBtn.textContent = "🔄 Refresh Now";
  }
}

// 🧠 When page loads, load donors and auto-refresh every 10 seconds
document.addEventListener("DOMContentLoaded", () => {
  loadDonations();
  setInterval(loadDonations, 10000); // auto-refresh every 10s
});
