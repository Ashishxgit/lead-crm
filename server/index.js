const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Lead = require('./models/leadModel');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crm_db';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Database
let isMongoConnected = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully:', MONGO_URI);
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('💡 Tip: Ensure MongoDB is running locally at mongodb://127.0.0.1:27017 or set MONGO_URI in .env');
  });

// In-Memory fallback store if MongoDB is offline (ensures demo works anytime out-of-the-box!)
let fallbackLeads = [
  {
    _id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    source: 'Website Contact Form',
    message: 'Interested in enterprise software consultation for our team of 25.',
    status: 'New',
    notes: 'Needs follow up call on Monday.',
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: '2',
    name: 'Alex Rivera',
    email: 'alex.rivera@techcorp.io',
    source: 'LinkedIn Ad',
    message: 'Requesting product demo and pricing catalog.',
    status: 'Contacted',
    notes: 'Sent pricing PDF. Waiting for response.',
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    _id: '3',
    name: 'Elena Rostova',
    email: 'elena@designstudio.com',
    source: 'Referral',
    message: 'Looking for custom web app development partner.',
    status: 'Converted',
    notes: 'Contract signed! Onboarding scheduled.',
    createdAt: new Date(Date.now() - 3600000 * 48)
  }
];

// Helper to check DB status
const isDbConnected = () => mongoose.connection.readyState === 1;

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. POST /api/leads - Save a new lead
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, source, message } = req.body;

    if (!name || !email || !source) {
      return res.status(400).json({ error: 'Name, email, and source are required fields.' });
    }

    if (isDbConnected()) {
      const newLead = new Lead({
        name,
        email,
        source,
        message: message || '',
        status: 'New',
        notes: ''
      });
      const savedLead = await newLead.save();
      return res.status(201).json(savedLead);
    } else {
      // Fallback mode
      const savedLead = {
        _id: Date.now().toString(),
        name,
        email,
        source,
        message: message || '',
        status: 'New',
        notes: '',
        createdAt: new Date()
      };
      fallbackLeads.unshift(savedLead);
      return res.status(201).json(savedLead);
    }
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead', details: error.message });
  }
});

// 2. GET /api/leads - Fetch all leads
app.get('/api/leads', async (req, res) => {
  try {
    if (isDbConnected()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      return res.json(leads);
    } else {
      // Fallback mode
      return res.json(fallbackLeads);
    }
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads', details: error.message });
  }
});

// 3. PUT /api/leads/:id - Update lead status or notes
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    if (isDbConnected()) {
      const updatedLead = await Lead.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updatedLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.json(updatedLead);
    } else {
      // Fallback mode
      const leadIndex = fallbackLeads.findIndex(l => l._id === id);
      if (leadIndex === -1) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      if (status !== undefined) fallbackLeads[leadIndex].status = status;
      if (notes !== undefined) fallbackLeads[leadIndex].notes = notes;

      return res.json(fallbackLeads[leadIndex]);
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead', details: error.message });
  }
});

// 4. DELETE /api/leads/:id - Delete a lead
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const deletedLead = await Lead.findByIdAndDelete(id);
      if (!deletedLead) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.json({ message: 'Lead deleted successfully', id });
    } else {
      // Fallback mode
      const initialLength = fallbackLeads.length;
      fallbackLeads = fallbackLeads.filter(l => l._id !== id);
      
      if (fallbackLeads.length === initialLength) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      return res.json({ message: 'Lead deleted successfully', id });
    }
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead', details: error.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 CRM Express Server listening on http://localhost:${PORT}`);
  console.log(`📌 API Routes available at http://localhost:${PORT}/api/leads`);
});
