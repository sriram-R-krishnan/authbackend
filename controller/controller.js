const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const dotenv = require('dotenv')

// Function for user signup
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function for user login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// nodemailer 

const crypto = require('crypto');
const nodemailer = require('nodemailer');
dotenv.config()
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
        Please click on the following link to reset your password:\n\n
        ${process.env.CLIENT_URL}/reset-password/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const restPassword = async (req, res) => {
    try {
      const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) {
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      }
      res.status(200).json({ message: 'Password reset link is valid.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  const updateResetPassword = async (req, res) => {
    try {
      const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) {
        return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password =hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: user.email,
        subject: 'Your password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Your password has been successfully changed.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

module.exports = { signup, login , forgotPassword ,restPassword ,updateResetPassword};
