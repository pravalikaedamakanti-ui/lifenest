const express = require('express');
const router = express.Router();
const { createUser } = require('../models/userModel');
const bcrypt = require('bcryptjs');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser(name, email, phone, hashedPassword);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

module.exports = router;
