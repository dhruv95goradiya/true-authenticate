import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';
import Contact from '../models/contacts.mjs';
import authenticate from '../middleware/authenticate.mjs';
import config from "../../config/config.mjs";
import crypto from 'crypto';
import { Sequelize } from 'sequelize';
// import { sequelize } from '../db/connection.mjs';

const router = express.Router();
const JWT_SECRET = config.JWT_SECRET;

// Function to generate JWT token
function generateToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
}

router.post('/register', async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;

    // Check if phone number is provided and valid
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number', message: 'Please provide a valid 10-digit phone number', data: null });
    }

    const existingUser = await User.findOne({ where: { phoneNumber } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Already Exists!', message: 'Phone number already registered', data: null });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('User created successfully!'); // Log a success message

    const newUser = await User.create({ name, phoneNumber, email, password: hashedPassword });
    return res.status(201).json({ success: true, data: newUser, error: null, message: 'User created!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error, message: 'Something went wrong!', data: null });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number', message: 'Please provide a valid 10-digit phone number', data: null });
    }

    const user = await User.findOne({ where: { phoneNumber } });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid', message: 'Invalid credentials', data: null });
    }
    const passwordMatch = await user.validPassword(password); // Use validPassword method
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid request!', message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.status(200).json({ success: true, data: { user, token }, error: null, message: 'Logged in successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message, message: 'Something went wrong!', data: null });
  }
});

// Mark number as spam
router.post('/mark-spam', authenticate, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Check if phone number is provided and valid
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number', message: 'Please provide a valid 10-digit phone number', data: null });
    }

    console.log(`Number ${phoneNumber} marked as spam`);
    return res.status(200).json({ success: true, message: `Number ${phoneNumber} marked as spam` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Something went wrong!', data: null });
  }
});

// Search by name
router.get('/search/by-name/:name', authenticate, async (req, res) => {
  try {
    const name = req.params.name;
    const users = await User.findAll({
      where: { name: { [Sequelize.Op.like]: `%${name}%` } },
      attributes: ['name', 'phoneNumber', 'email']
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found with this name', data: null });
    }

    const searchResults = users.map(user => ({
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      spamLikelihood: 0
    }));
    return res.status(200).json({ success: true, data: searchResults, message: 'Search result fetched!', error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Something went wrong!', data: null });
  }
});

// Search by phone number
router.get('/search/by-number/:phoneNumber', authenticate, async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;

    // Check if phone number is provided and valid
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number', message: 'Please provide a valid 10-digit phone number', data: null });
    }

    const users = await User.findAll({ where: { phoneNumber } });

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found with this phone number', data: null });
    }

    // Logic to calculate spam likelihood for each user
    // For now, spam likelihood is always 0 - assuming
    const searchResults = users.map(user => ({
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      spamLikelihood: 0
    }));
    return res.status(200).json({ success: true, data: searchResults, message: 'Search result fetched!', error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Server error', message: 'Something went wrong!', data: null });
  }
});


// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    return res.status(200).json({
      success: true, data: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: 'Server error' });
  }
});

export default router;
