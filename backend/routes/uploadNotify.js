// backend/routes/uploadNotify.js
// POST /api/upload-notify  — called by client portal after upload
// Sends admin notification email and logs to EmailLog
const express  = require('express');
const router   = express.Router();
const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// POST /api/upload-notify
router.post('/', async (req, res) => {
  try {
    const { clientId, clientName, clientEmail, fileName, docType, taxYear, notes } = req.body;
    if (!clientName || !fileName) {
      return res.status(400).json({ success: false, error: 'Missing clientName or fileName' });
    }

    const adminEmail = process.env.SMTP_USER;
    const ts         = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    const subject = '[LedgerForge] ' + clientName + ' uploaded ' + fileName;
    const html = '<html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">'
      + '<div style="max-width:540px;margin:0 auto;background:#1a2332;border-radius:12px;padding:28px;color:#e2e8f0">'
      + '<h2 style="color:#22b5b9;margin:0 0 16px">New Client Upload</h2>'
      + '<p><strong style="color:#94a3b8">Client:</strong> ' + clientName + '</p>'
      + '<p><strong style="color:#94a3b8">File:</strong> <span style="color:#ecc94b">' + fileName + '</span></p>'
      + '<p><strong style="color:#94a3b8">Type:</strong> ' + (docType||'n/a') + '</p>'
      + '<p><strong style="color:#94a3b8">Tax Year:</strong> ' + (taxYear||'n/a') + '</p>'
      + (notes ? '<p><strong style="color:#94a3b8">Notes:</strong> ' + notes + '</p>' : '')
      + '<p style="font-size:13px;color:#94a3b8">Uploaded at ' + ts + ' ET - log in to LedgerForge to review.</p>'
      + '</div></body></html>';

    const plain = 'New upload from ' + clientName + '\nFile: ' + fileName + '\nType: ' + (docType||'n/a') + '\nYear: ' + (taxYear||'n/a') + (notes ? '\nNotes: ' + notes : '') + '\nAt: ' + ts;

    await mailer.sendMail({
      from: '"LedgerForge" <' + adminEmail + '>',
      to:   adminEmail,
      subject, text: plain, html,
    });

    await EmailLog.create({
      clientId: clientId || '', clientName: clientName || '',
      clientEmail: clientEmail || '', templateName: 'upload_notify',
      templateCategory: 'portal', subject, body: plain,
      sentBy: 'system', status: 'sent', isAutomatic: true,
    }).catch(e => console.warn('[upload-notify] log error:', e.message));

    res.json({ success: true });
  } catch (err) {
    console.error('[upload-notify] error:', err.message);
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
