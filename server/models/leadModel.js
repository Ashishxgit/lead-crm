const mongoose = require('mongoose');

// Mongoose Schema definition for a Lead
const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  source: {
    type: String,
    required: [true, 'Lead source is required'],
    trim: true
  },
  message: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Converted'],
    default: 'New'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Lead Model
module.exports = mongoose.model('Lead', leadSchema);
