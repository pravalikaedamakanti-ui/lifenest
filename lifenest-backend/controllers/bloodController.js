const { addBloodDonation } = require('../models/bloodModel'); // Import model

// Function to handle blood donation submission
const donateBlood = async (req, res) => {
  try {
    const donor = req.body; // Get data from frontend form
    const newDonor = await addBloodDonation(donor); // Save in DB
    res.status(201).json({ message: 'Blood donation registered successfully', data: newDonor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { donateBlood }; // Export to use in routes
