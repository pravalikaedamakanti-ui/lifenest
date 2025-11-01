const pool = require('../config/db'); // Import database connection

// Function to add organ donation
const addOrganDonation = async (donor) => {
  const { name, email, organType, gender } = donor;
  const query = `
    INSERT INTO organ_donations (name, email, organ_type, gender)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [name, email, organType, gender];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { addOrganDonation };
