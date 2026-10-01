import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Send, 
  Search, 
  Filter, 
  FileText,
  UserCheck
} from 'lucide-react';

export default function App() {
  // Navigation State ('dashboard' or 'publicForm')
  const [activeTab, setActiveTab] = useState('dashboard');

  // Leads Data State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State for Public Lead Submission
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    source: 'Website Contact Form',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Dashboard Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch all leads on initial component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // API Call: GET /api/leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/leads');
      setLeads(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to load leads. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  // API Call: POST /api/leads (Public Lead Submission)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/leads', formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        source: 'Website Contact Form',
        message: ''
      });
      // Refresh lead list
      fetchLeads();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // API Call: PUT /api/leads/:id (Update Status)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`/api/leads/${id}`, { status: newStatus });
      setLeads(leads.map(lead => (lead._id === id ? response.data : lead)));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Could not update status.');
    }
  };

  // API Call: PUT /api/leads/:id (Update Follow-up Notes)
  const handleNoteUpdate = async (id, newNote) => {
    try {
      const response = await axios.put(`/api/leads/${id}`, { notes: newNote });
      setLeads(leads.map(lead => (lead._id === id ? response.data : lead)));
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  // API Call: DELETE /api/leads/:id (Delete Lead)
  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await axios.delete(`/api/leads/${id}`);
      setLeads(leads.filter(lead => lead._id !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Could not delete lead.');
    }
  };

  // Filtered Leads Calculation
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Dashboard Metrics
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const contactedLeadsCount = leads.filter(l => l.status === 'Contacted').length;
  const convertedLeadsCount = leads.filter(l => l.status === 'Converted').length;

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">📈</div>
          <div>
            <h1 className="brand-title">LeadFlow CRM</h1>
            <p className="brand-subtitle">Manage & Convert Website Inquiries Effortlessly</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Users size={16} /> Admin Dashboard ({leads.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'publicForm' ? 'active' : ''}`}
            onClick={() => setActiveTab('publicForm')}
          >
            <PlusCircle size={16} /> Public Lead Form
          </button>
        </nav>
      </header>

      {/* VIEW 1: ADMIN LEAD DASHBOARD */}
      {activeTab === 'dashboard' && (
        <main>
          {/* Metrics Header */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon total"><Users size={22} /></div>
              <div>
                <div className="metric-value">{totalLeadsCount}</div>
                <div className="metric-label">Total Inquiries</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon new"><Clock size={22} /></div>
              <div>
                <div className="metric-value">{newLeadsCount}</div>
                <div className="metric-label">New Leads</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon contacted"><FileText size={22} /></div>
              <div>
                <div className="metric-value">{contactedLeadsCount}</div>
                <div className="metric-label">In Contact</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon converted"><UserCheck size={22} /></div>
              <div>
                <div className="metric-value">{convertedLeadsCount}</div>
                <div className="metric-label">Converted Clients</div>
              </div>
            </div>
          </div>

          {/* Lead Table Glass Card */}
          <div className="glass-card">
            {/* Table Header / Controls */}
            <div className="table-header-bar">
              <h2 className="table-title">Lead Pipeline</h2>
              
              <div className="table-controls">
                {/* Search Bar */}
                <input 
                  type="text"
                  placeholder="Search name, email, source..."
                  className="form-input search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Status Filter */}
                <select 
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Converted">Converted</option>
                </select>
              </div>
            </div>

            {/* Error / Loading State */}
            {loading ? (
              <div className="empty-state">Loading leads from server...</div>
            ) : error ? (
              <div className="empty-state" style={{ color: 'var(--accent-rose)' }}>{error}</div>
            ) : (
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Lead Info</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Follow-Up Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          No leads found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => (
                        <tr key={lead._id}>
                          {/* Created Date */}
                          <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                            {new Date(lead.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>

                          {/* Lead Name, Email & Message */}
                          <td>
                            <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                              {lead.name}
                            </strong>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              {lead.email}
                            </span>
                            {lead.message && (
                              <p style={{ 
                                fontSize: '0.8rem', 
                                color: 'var(--text-muted)', 
                                marginTop: '4px',
                                fontStyle: 'italic'
                              }}>
                                "{lead.message}"
                              </p>
                            )}
                          </td>

                          {/* Source */}
                          <td>
                            <span style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)'
                            }}>
                              {lead.source}
                            </span>
                          </td>

                          {/* Status Dropdown */}
                          <td>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                              className={`status-badge ${lead.status}`}
                              style={{ cursor: 'pointer', outline: 'none' }}
                            >
                              <option value="New" style={{ background: '#1e293b', color: '#38bdf8' }}>
                                🔵 New
                              </option>
                              <option value="Contacted" style={{ background: '#1e293b', color: '#fbbf24' }}>
                                🟡 Contacted
                              </option>
                              <option value="Converted" style={{ background: '#1e293b', color: '#34d399' }}>
                                🟢 Converted
                              </option>
                            </select>
                          </td>

                          {/* Follow-Up Note Text Input */}
                          <td style={{ minWidth: '200px' }}>
                            <input
                              type="text"
                              className="note-input"
                              placeholder="Add follow-up note..."
                              defaultValue={lead.notes || ''}
                              onBlur={(e) => handleNoteUpdate(lead._id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleNoteUpdate(lead._id, e.target.value);
                                  e.target.blur();
                                }
                              }}
                            />
                          </td>

                          {/* Delete Action Button */}
                          <td>
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              className="btn-delete"
                              title="Delete lead"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW 2: PUBLIC LEAD FORM (Simulated Website Form) */}
      {activeTab === 'publicForm' && (
        <main style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="glass-card">
            <h2 className="form-title">Simulated Website Contact Form</h2>
            <p className="form-subtitle">
              Submitting this form simulates a visitor filling out an inquiry on your website. 
              The data will immediately save via <code>POST /api/leads</code> into the CRM.
            </p>

            {submitSuccess && (
              <div className="alert-success">
                <CheckCircle size={20} />
                <span>Thank you! Your lead inquiry was successfully submitted to the CRM.</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Source */}
                <div className="form-group full-width">
                  <label htmlFor="source">Inquiry Source *</label>
                  <select
                    id="source"
                    className="form-select"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  >
                    <option value="Website Contact Form">Website Contact Form</option>
                    <option value="Google Search">Google Search</option>
                    <option value="LinkedIn Ad">LinkedIn Ad</option>
                    <option value="Customer Referral">Customer Referral</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>

                {/* Message */}
                <div className="form-group full-width">
                  <label htmlFor="message">Message / Project Details</label>
                  <textarea
                    id="message"
                    className="form-textarea"
                    placeholder="Describe what services or products you are interested in..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting}
                >
                  <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Inquiry Lead'}
                </button>
              </div>
            </form>
          </div>
        </main>
      )}
    </div>
  );
}
