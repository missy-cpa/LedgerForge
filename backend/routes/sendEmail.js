// backend/routes/sendEmail.js
// POST /api/send-email  — general purpose email sender
// Sends email via SMTP and logs to EmailLog collection
const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');
const EmailLog   = require('../models/EmailLog');

const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// POST /api/send-email
router.post('/', async (req, res) => {
  try {
    const { to, subject, body, html, clientId, clientName, clientEmail, templateName } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ success: false, error: 'Missing to or subject' });
    }

    await mailer.sendMail({
      from: '"Michelle Soele PLLC" <' + process.env.SMTP_USER + '>',
      to,
      subject,
      text:  body || '',
      html:  html || body || '',
    });

    if (clientId || clientName) {
      await EmailLog.create({
        clientId:     clientId || '',
        clientName:   clientName || '',
        clientEmail:  clientEmail || to,
        templateName: templateName || 'manual',
        templateCategory: 'general',
        subject,
        body: body || '',
        sentBy: 'system',
        status: 'sent',
        isAutomatic: false,
      }).catch(e => console.warn('[send-email] log error:', e.message));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[send-email] error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
