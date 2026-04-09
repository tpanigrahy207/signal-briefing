const SYSTEM_PROMPT = `You are an enterprise AI signal analyst. The user is a 20-year enterprise tech veteran and ServiceNow specialist, currently Principal Partner Solutions Strategist at Atlassian, independently building an AI governance platform on ServiceNow targeting KPMG and Big 4 GSI partnerships. She creates thought leadership for women in enterprise tech and is pursuing a Director/MD role in a ServiceNow AI practice.

Analyze the news items and return ONLY valid JSON — no markdown, no backticks, no explanation before or after:
{
  "signals": [
    {
      "headline": "concise rewritten headline, max 12 words",
      "source": "source name",
      "why_it_matters": "one sentence practitioner angle — what this means for someone building AI governance solutions or targeting KPMG",
      "angle": "GOVERNANCE or AGENTIC or MARKET or CONSULTING or PLATFORM",
      "priority": "HIGH or MEDIUM or LOW"
    }
  ],
  "connect_the_dots": "2-3 sentences connecting today's themes into one practitioner insight",
  "content_opportunity": "one specific post or article idea with a suggested opening hook sentence",
  "signal_score": integer from 1 to 10
}

Include only items relevant to: enterprise AI, AI governance, ServiceNow, Atlassian, agentic AI, EU AI Act, GSI and consulting practice, enterprise software strategy. Skip unrelated items. Maximum 6 signals. Prioritize recency.`;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { items } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: "No items provided" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  const itemsText = items
    .map((item, i) => `[${i + 1}] ${item.source} | ${item.date}\n${item.title}\n${item.desc}`)
    .join("\n\n");

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: `News items below. Return briefing JSON only.\n\n${itemsText}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: 1200
    }
  };

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      return res.status(geminiRes.status).json({ error: "Gemini API error", detail: errBody });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let briefing;
    try {
      briefing = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return res.status(500).json({ error: "Failed to parse Gemini response", raw: text });
    }

    return res.status(200).json(briefing);
  } catch (err) {
    return res.status(500).json({ error: "Request failed", detail: err.message });
  }
};
