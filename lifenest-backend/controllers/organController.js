const { addOrganDonation } = require('../models/organModel'); // Import model

// Function to handle organ donation submission
const donateOrgan = async (req, res) => {
  try {
    const donor = req.body; // Get data from frontend form
    const newDonor = await addOrganDonation(donor); // Save in DB
    res.status(201).json({ message: 'Organ donation registered successfully', data: newDonor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { donateOrgan }; // Export to use in routes
