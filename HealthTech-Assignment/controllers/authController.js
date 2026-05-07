const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

// POST /api/auth/register
function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (UserModel.findByEmail(email)) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const newId = UserModel.create({ name, email, password: hashedPassword, role });
    const user  = UserModel.findById(newId);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// POST /api/auth/login
function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = UserModel.findByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// GET /api/auth/me
function getMe(req, res) {
  try {
    const user = UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = { register, login, getMe };
