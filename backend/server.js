require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { connectDB } = require('./db');
const app        = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',            require('./routes/auth'));
app.use('/api/clients',         require('./routes/clients'));
app.use('/api/staff',           require('./routes/staff'));
app.use('/api/invoices',        require('./routes/invoices'));
app.use('/api/documents',       require('./routes/documents'));
app.use('/api/workflow',        require('./routes/workflow'));
app.use('/api/ai',              require('./routes/ai'));
app.use('/auth/google',         require('./routes/google').router);
app.use('/api/settings',        require('./routes/settings'));
app.use('/api/email-templates', require('./routes/emailTemplates'));
app.use('/api/email-log',       require('./routes/emailLog'));
app.use('/api/portal-invite',   require('./routes/portalInvite'));
app.use('/api/vault',           require('./routes/vault'));
app.use('/api/upload-notify',   require('./routes/uploadNotify'));
app.use('/api/send-email',      require('./routes/sendEmail'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('LedgerForge backend running on port ' + PORT));
