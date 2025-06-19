// server/slackNotifier.js
const axios = require('axios');

async function notifySlack({ candidate, convoSummary, evaluation, structured }) {
  console.log('🚀 Baue Slack-Nachricht');

  // Header
  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `Interview mit ${candidate}` }
    },
    // 1) Gesprächszusammenfassung
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Zusammenfassung des Gesprächs:*\n${convoSummary}`
      }
    },
    { type: 'divider' },
    // 2) Matrix-Bewertung
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Analyse / Bewertung:*\n${evaluation}`
      }
    }
  ];

  // Optional 3) strukturierte Daten
  if (structured) {
    blocks.push({ type: 'divider' });
    if (structured.strengths) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stärken:* ${structured.strengths.join(', ')}`
        }
      });
    }
    if (structured.weaknesses) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Schwächen:* ${structured.weaknesses.join(', ')}`
        }
      });
    }
    if (structured.recommendation) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Empfehlung:* ${structured.recommendation}`
        }
      });
    }
  }

  const payload = { blocks };
  console.log('📨 Slack Payload:', JSON.stringify(payload, null, 2));

  const resp = await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
  console.log(`✅ Slack API responded: ${resp.status}`);
}

module.exports = { notifySlack };
