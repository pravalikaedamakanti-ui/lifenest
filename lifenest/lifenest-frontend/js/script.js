// Select form elements
const form = document.getElementById("bloodForm");
const submitButton = document.getElementById("donateBtn");
const healthSelect = document.getElementById("healthIssues");

// 🧠 Function to enable/disable Submit button
function toggleSubmit() {
  const value = healthSelect.value.trim().toLowerCase();
  const restricted = ["sugar", "bp", "blood pressure", "aids", "hiv", "other"];

  if (restricted.includes(value)) {
    // Disable submit if any health issue other than 'none' selected
    submitButton.disabled = true;
    submitButton.textContent = "❌ Cannot Submit";
    submitButton.style.background = "#ccc";
    submitButton.style.cursor = "not-allowed";
    submitButton.style.boxShadow = "none";
  } else {
    // Enable submit if 'none' or empty
    submitButton.disabled = false;
    submitButton.textContent = "Submit 💖";
    submitButton.style.background = "linear-gradient(to right, #4facfe, #00f2fe)";
    submitButton.style.cursor = "pointer";
    submitButton.style.boxShadow = "0 0 12px rgba(0, 200, 255, 0.5)";
  }
}

// Run when dropdown changes or when page loads
healthSelect.addEventListener("change", toggleSubmit);
toggleSubmit();

// 🩸 Form submission logic
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const area = document.getElementById("area").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const bloodType = document.getElementById("bloodType").value;
  const healthIssues = healthSelect.value.trim().toLowerCase();

  // 🧾 Age validation
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  if (age < 18) {
    alert("⚠️ You must be 18 or older to donate blood.");
    return;
  }

  // 🚫 Prevent donation if health issue other than 'none'
  const restricted = ["sugar", "bp", "blood pressure", "aids", "hiv", "other"];
  if (restricted.includes(healthIssues)) {
    alert(`❌ Cannot donate due to ${healthIssues}.`);
    return;
  }

  // ✅ Proceed only when health issue is 'none'
  if (healthIssues === "none") {
    try {
      const response = await fetch("http://localhost:5000/api/blood/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          dob,
          gender,
          area,
          phone,
          bloodType,
          healthIssues,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Submission recorded successfully!");
        form.reset();
        toggleSubmit(); // Reset button state after form clears
      } else {
        alert(result.message || "⚠️ Something went wrong.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("❌ Error submitting form.");
    }
  }
});
