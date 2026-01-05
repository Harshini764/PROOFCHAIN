import React, { useState, useEffect } from 'react';

// Virtual Verification Assistant
// - Receives `verificationStatus` (string) and `verificationReasons` (array of strings)
// - Generates a short, human-friendly explanation using Google Gemini (optional)
// - Falls back to a deterministic, non-hallucinating template when API is not configured

export default function VerificationAssistant({ verificationStatus, verificationReasons = [], geminiEndpoint, geminiApiKey, useLocalFallback = true }) {
  const [messages, setMessages] = useState([]); // { sender: 'assistant'|'user', text }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset messages when verification data changes
    setMessages([
      { sender: 'system', text: `Verification data received. Status: ${verificationStatus || 'Unknown'}. Reasons: ${verificationReasons && verificationReasons.length ? verificationReasons.join(' | ') : 'None provided'}.` }
    ]);
    setError('');
  }, [verificationStatus, JSON.stringify(verificationReasons)]);

  function deterministicExplain(status, reasons) {
    // This function NEVER invents facts; it explains only based on inputs
    const lines = [];
    lines.push(`Result: ${status || 'Unknown'}.`);

    if (!status || status === 'Unknown') {
      lines.push('No verification result is available.');
      lines.push('Action: Please run verification first.');
      return lines.join('\n\n');
    }

    // Short summary
    if (status === 'Verified') {
      lines.push('Summary: The certificate passed all checks based on the provided data.');
    } else if (status === 'Partially Verified') {
      lines.push('Summary: The certificate passed some checks but has issues that may require follow-up.');
    } else {
      lines.push('Summary: The certificate failed verification checks based on the provided data.');
    }

    // Reasons
    if (reasons && reasons.length) {
      lines.push('Why:');
      reasons.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    } else {
      lines.push('Why: No specific reasons were provided.');
    }

    // Trust recommendation (only derived from status)
    if (status === 'Verified') {
      lines.push('Recommendation: Based on the provided verification data, the certificate can be trusted.');
    } else if (status === 'Partially Verified') {
      lines.push('Recommendation: Treat the certificate with caution. Consider contacting the issuer for clarification or verifying the missing fields.');
    } else {
      lines.push('Recommendation: Do not trust this certificate without further independent verification.');
    }

    // Always avoid making claims that aren't in the input
    lines.push('Note: This explanation is based only on the provided verification status and reasons and does not introduce any additional facts.');

    return lines.join('\n\n');
  }

  async function callGemini(prompt) {
    // If a direct endpoint and key are supplied, try calling Gemini.
    // NOTE: It's recommended to proxy the request through a server to avoid exposing keys.
    const endpoint = geminiEndpoint || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_ENDPOINT) || null;
    const key = geminiApiKey || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || null;
    if (!endpoint || !key) throw new Error('Gemini endpoint or API key not configured');

    // Construct a strict, no-hallucination system prompt
    const systemPrompt = `You are a verification assistant. ONLY use the facts provided in the input. Do NOT invent facts, do NOT guess, and do NOT provide information that is not directly supported by the provided status and reasons.`;
    const userPrompt = prompt;

    // The exact Gemini API payload differs per deployment; this POST is generic and the server may need adaptation.
    const body = {
      model: 'gemini-pro',
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      max_output_tokens: 400
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${txt}`);
    }

    const data = await res.json();

    // Expect the provider to return an output text in a known field; attempt several common structures
    if (data.output && typeof data.output === 'string') return data.output;
    if (data.output_text) return data.output_text;
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) return data.choices[0].message.content;
    if (data.choices && data.choices[0] && data.choices[0].output_text) return data.choices[0].output_text;

    // As a last resort, return JSON-stringified body (but this should not happen often)
    return JSON.stringify(data);
  }

  async function generateExplanation() {
    setLoading(true);
    setError('');
    const prompt = `Explain the following verification result in plain language for a non-technical user.\n\nStatus: ${verificationStatus}\nReasons: ${verificationReasons && verificationReasons.length ? verificationReasons.join(' | ') : 'None'}\n\nRules: Only use the information provided (status and reasons). Do not invent or assume facts beyond these inputs. Keep the explanation short and clear.`;

    try {
      let explanation = null;
      // Attempt to call Gemini if configured
      try {
        explanation = await callGemini(prompt);
      } catch (apiErr) {
        // Fall back to deterministic text if allowed
        if (!useLocalFallback) throw apiErr;
        explanation = deterministicExplain(verificationStatus, verificationReasons);
      }

      setMessages(m => [...m, { sender: 'assistant', text: explanation }]);
    } catch (err) {
      setError(err.message || String(err));
      setMessages(m => [...m, { sender: 'assistant', text: deterministicExplain(verificationStatus, verificationReasons) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 p-3 border rounded bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Virtual Verification Assistant</div>
        <div className="text-xs text-slate-500">Explains verification results (no hallucinations)</div>
      </div>

      <div className="space-y-3 mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded ${m.sender === 'assistant' ? 'bg-slate-50' : 'bg-slate-100'}`}>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
      </div>

      {error && <div className="text-sm text-red-500 mb-2">Error: {error}</div>}

      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={generateExplanation} disabled={loading || !verificationStatus}>
          {loading ? 'Generating…' : 'Explain' }
        </button>
        <button className="px-3 py-1 rounded border text-sm" onClick={() => setMessages([])}>
          Clear
        </button>
        <div className="text-xs text-slate-500">{!verificationStatus ? 'Run verification to enable explanation' : ''}</div>
      </div>

      <div className="mt-3 text-xs text-slate-400">Tip: To enable AI-generated explanations connect a Gemini endpoint via env var <code>VITE_GEMINI_ENDPOINT</code> and <code>VITE_GEMINI_API_KEY</code> or pass props <code>geminiEndpoint</code>/<code>geminiApiKey</code>. It's safer to proxy requests through a server to avoid exposing keys in the browser.</div>
    </div>
  );
}
