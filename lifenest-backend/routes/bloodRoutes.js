const express = require('express');
const router = express.Router();

let donations = [];

router.post('/donate', (req, res) => {
  const { name, bloodType, age } = req.body;

  if (!name || !bloodType || !age) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const donation = { name, bloodType, age };
  donations.push(donation);

  console.log('Blood donation received:', donation);
  res.json({ success: true, message: 'Blood donation recorded successfully!' });
});

router.get('/donations', (req, res) => {
  res.json(donations);
});

module.exports = router;
