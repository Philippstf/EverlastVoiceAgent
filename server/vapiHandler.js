// server/vapiHandler.js
const { notifySlack } = require('./slackNotifier');

async function handleVapiEvent(payload) {
  console.log('▶️ handleVapiEvent startet');

  // VAPI-v2 wrapper
  const msgA = payload.message?.analysis;
  // VAPI-v1 fallback
  const callA = payload.call?.analysis;

  // 1) Inhalts-Zusammenfassung (Summary)
  const convoSummary = msgA?.conversationalSummary 
                    || msgA?.summary         // falls V2 summary genutzt
                    || callA?.summary;       // V1

  // 2) Matrix-Bewertung
  const evaluation = msgA?.successEvaluation 
                  || callA?.successEvaluation;

  // 3) Strukturierte Daten
  const structured = msgA?.structuredData || callA?.structuredData;

  if (!convoSummary) {
    console.warn('⚠️ Keine Gesprächs-Zusammenfassung gefunden – Abbruch');
    return;
  }
  if (!evaluation) {
    console.warn('⚠️ Keine Erfolgsauswertung (Rubric) gefunden – Abbruch');
    return;
  }

  // Candidate aus structured oder call.customer
  const candidate =
    payload.call?.customer?.number ||
    payload.caller_id ||
    structured?.candidateName ||
    'Unbekannt';

  await notifySlack({
    candidate,
    convoSummary,
    evaluation,
    structured
  });
}

module.exports = { handleVapiEvent };
