// src/middleware/authenticate.mjs
import jwt from 'jsonwebtoken';
import config from '../../config/config.mjs';
import User from "../models/user.mjs";

export default async function authenticate(req, res, next) {
  // Get token from header
  const token = req.header('Authorization');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization denied', data: null, error:'Invalid request!' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log(decoded);
    // Check if decoded token contains user data
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    // Fetch user from database
    const user = await User.findByPk(decoded.userId);
    console.log('user',user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Attach user data to request object
    req.user = {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    } else {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
}
