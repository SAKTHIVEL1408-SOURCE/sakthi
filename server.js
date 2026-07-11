const express = require('express');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'friends-cctv-cyber-key-999';

// Setup paths
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure database folder & file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
}


// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USER || 'friends cctv tech';
const ADMIN_PASSWORD_RAW = process.env.ADMIN_PASS || 'arun@8072';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD_RAW, 10);

// Public login credentials
const USERNAME = process.env.USERNAME || 'friends cctv tech';
const PASSWORD = process.env.PASSWORD || 'arun@8072';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'YOUR_GMAIL@gmail.com',
    pass: process.env.EMAIL_PASS || 'YOUR_APP_PASSWORD'
  }
});

// Helper to send notification emails
const sendNotificationEmail = async (subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
    throw err;
  }
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === USERNAME && password === PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

// (server will be started at the end of this file)

// Serve static assets from project root (index.html, style.css, script.js)
app.use(express.static(__dirname));
// Serve static assets from public/ folder (admin dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// JWT authentication middleware for admin routes
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.admin = decoded;
    next();
  });
};

// Database utility functions
const getLeads = () => {
  try {
    const rawData = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
};

const saveLeads = (leads) => {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
};

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Submit a Free Quote Request
app.post('/api/quote', (req, res) => {
  const { name, phone, email, service, property, message } = req.body;

  // Server-side validation
  if (!name || !name.trim() || !phone || !phone.trim() || !service) {
    return res.status(400).json({ message: 'Full Name, Phone, and Service fields are required.' });
  }

  const leads = getLeads();
  const newLead = {
    id: 'Q-' + Date.now(),
    type: 'quote',
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : 'N/A',
    service: service,
    property: property || 'N/A',
    message: message ? message.trim() : 'No extra requirements specified.',
    status: 'Pending', // Pending, Contacted, Completed
    createdAt: new Date().toISOString()
  };

  leads.unshift(newLead); // Add new lead to the beginning of the list
  
  if (saveLeads(leads)) {
    console.log(`[LEAD] New Free Quote Request: ${newLead.name} (${newLead.phone}) - ${newLead.service}`);
    // Send notification email to configured recipient (best-effort)
    (async () => {
      try {
        const subject = `New Quote Request: ${newLead.name} - ${newLead.service}`;
        const text = `Name: ${newLead.name}\nPhone: ${newLead.phone}\nEmail: ${newLead.email}\nService: ${newLead.service}\nProperty: ${newLead.property}\nMessage: ${newLead.message}`;
        const html = `<h3>New Quote Request</h3><p><strong>Name:</strong> ${newLead.name}</p><p><strong>Phone:</strong> ${newLead.phone}</p><p><strong>Email:</strong> ${newLead.email}</p><p><strong>Service:</strong> ${newLead.service}</p><p><strong>Property:</strong> ${newLead.property}</p><p><strong>Message:</strong> ${newLead.message}</p>`;
        await sendNotificationEmail(subject, text, html);
      } catch (err) {
        // Logging already done in helper; continue without blocking the response
      }
    })();

    res.status(201).json({ message: 'Quote request submitted successfully!', lead: newLead });
  } else {
    res.status(500).json({ message: 'Server database error. Please try again later.' });
  }
});

// 2. Submit a Callback Request (Modal/Quick Callback)
app.post('/api/callback', (req, res) => {
  const { name, phone } = req.body;

  if (!name || !name.trim() || !phone || !phone.trim()) {
    return res.status(400).json({ message: 'Name and Phone number are required.' });
  }

  const leads = getLeads();
  const newCallback = {
    id: 'C-' + Date.now(),
    type: 'callback',
    name: name.trim(),
    phone: phone.trim(),
    email: 'N/A',
    service: 'Quick Callback Request',
    property: 'N/A',
    message: 'Requested urgent callback (15 minutes).',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  leads.unshift(newCallback);
  
  if (saveLeads(leads)) {
    console.log(`[LEAD] New Urgent Callback: ${newCallback.name} (${newCallback.phone})`);
    // Send notification email to configured recipient (best-effort)
    (async () => {
      try {
        const subject = `New Callback Request: ${newCallback.name}`;
        const text = `Name: ${newCallback.name}\nPhone: ${newCallback.phone}`;
        const html = `<h3>New Callback Request</h3><p><strong>Name:</strong> ${newCallback.name}</p><p><strong>Phone:</strong> ${newCallback.phone}</p>`;
        await sendNotificationEmail(subject, text, html);
      } catch (err) {
        // ignore
      }
    })();

    res.status(201).json({ message: 'Callback request registered!', callback: newCallback });
  } else {
    res.status(500).json({ message: 'Server database error. Please try again later.' });
  }
});

// Test email endpoint (useful to verify transporter config)
app.post('/api/test-email', async (req, res) => {
  const { subject, message, to } = req.body || {};
  const mailSubject = subject || 'Test Email from Friends CCTV Tech';
  const mailText = message || 'This is a test email to verify SMTP configuration.';
  try {
    await sendNotificationEmail(mailSubject, mailText, `<p>${mailText}</p>`);
    res.json({ success: true, message: 'Test email sent (if SMTP configured).' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send test email', error: err.message });
  }
});

// 3. Admin Login Endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Check username match
  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Invalid admin username or password' });
  }

  // Verify password with bcrypt
  const isMatch = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid admin username or password' });
  }

  // Generate JWT token
  const token = jwt.sign({ username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, message: 'Login successful' });
});

// 4. Retrieve All Leads (Authorized Admin only)
app.get('/api/admin/leads', authenticateAdmin, (req, res) => {
  const leads = getLeads();
  res.json(leads);
});

// 5. Update Lead Status (Authorized Admin only)
app.post('/api/admin/leads/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Contacted', 'Completed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid or missing status value' });
  }

  const leads = getLeads();
  const leadIndex = leads.findIndex(l => l.id === id);

  if (leadIndex === -1) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  leads[leadIndex].status = status;
  
  if (saveLeads(leads)) {
    console.log(`[LEAD UPDATE] Lead ${id} status changed to: ${status}`);
    res.json({ message: 'Lead status updated successfully', lead: leads[leadIndex] });
  } else {
    res.status(500).json({ message: 'Failed to update lead status.' });
  }
});

// Handle catch-all routes to serve index.html (SPA feel)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Friends CCTV Tech server is running!`);
  console.log(`🌐 Local Website URL:  http://localhost:${PORT}`);
  console.log(`🔑 Admin Dashboard:    http://localhost:${PORT}/admin.html`);
  console.log(`🛡  Admin Username:   ${ADMIN_USERNAME}`);
  console.log(`🔒 Admin Password:   (hidden - set via ADMIN_PASS environment variable)`);
  console.log(`======================================================\n`);
});
