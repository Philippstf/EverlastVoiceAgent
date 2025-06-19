require('dotenv').config({ path: '.env' }); // oder ohne path, wenn .env in server/
const express = require('express');
const bodyParser = require('body-parser');
const { handleVapiEvent } = require('./vapiHandler');

const app = express();
app.use(bodyParser.json());

app.post('/vapi-webhook', async (req, res) => {
  console.log('🔔 Eingehende Headers:', req.headers);

  // Secret-Check
  const incoming = req.get('x-vapi-secret') || req.get('X-Vapi-Secret');
  if (!incoming || incoming !== process.env.VAPI_SECRET) {
    console.warn('⚠️ Ungültiges Secret:', incoming);
    return res.status(401).send('Unauthorized');
  }

  // **Hier filtern wir erst auf End-of-Call**:
  const eventType = req.body.message?.type || req.body.type;
  console.log('ℹ️ Event-Typ:', eventType);
  if (eventType !== 'end-of-call-report') {
    console.log(`ℹ️ Ignoriere Event-Typ ${eventType}`);
    return res.status(204).send();  // kein Slack-Post, kein Fehler
  }

  // **Erst jetzt weiterleiten, wenn es wirklich End-of-Call ist**
  try {
    await handleVapiEvent(req.body);
    console.log('✅ handleVapiEvent erfolgreich');
    return res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Fehler in handleVapiEvent:', err);
    return res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook-Server läuft auf Port ${PORT}`);
});
