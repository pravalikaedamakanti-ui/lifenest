const pool = require('../config/db'); // Import database connection

// Function to add blood donation
const addBloodDonation = async (donor) => {
  const { name, email, bloodType, gender } = donor;
  const query = `
    INSERT INTO blood_donations (name, email, blood_type, gender)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [name, email, bloodType, gender];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { addBloodDonation };
