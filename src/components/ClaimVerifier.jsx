import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import VerificationAssistant from './VerificationAssistant';

// ----------------------
// Helper functions
// ----------------------

// Stable stringify (sort keys) for consistent hashing
function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}

async function sha256Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Mocked Gemini / LLM extraction - replace with real API call when ready
// If you want to swap to a real Gemini call, pass an apiKey and uncomment the fetch block below
export async function extractClaimsFromText(text, apiKey = null) {
  // Basic heuristics to extract simple structured data from text
  const result = {
    issuer: '',
    product_or_document: '',
    productId: '',
    batchNumber: '',
    issueDate: '',
    issued_date: '',
    claims: []
  };

  if (!text || !text.trim()) {
    return result;
  }

  // Normalize spacing and line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();

  // Use the robust parser to extract standard fields first
  const cert = parseCertificateText(normalized);
  result.issuer = cert.issuer;
  result.product_or_document = cert.productId || result.product_or_document;
  result.productId = cert.productId || '';
  result.batchNumber = cert.batchNumber || '';
  result.issueDate = cert.issueDate || '';

  // Try to extract common metadata variants
  const issuerMatch = normalized.match(/(?:manufactured by|manufacturer|issuer|issued by)[:\-]\s*(.+)/i);
  const productMatch = normalized.match(/(?:product id|product name|product|document)[:\-]\s*(.+)/i);
  const dateMatch = normalized.match(/(?:manufacture date|manufactured on|issued date|date)[:\-]\s*([0-9]{4}[-\/.][0-9]{1,2}[-\/.][0-9]{1,2}|[0-9]{1,2}[-\/.][0-9]{1,2}[-\/.][0-9]{2,4})/i);
  const batchMatch = normalized.match(/(?:batch number|batch no\.?|batch)[:\-]\s*(\S+)/i);

  if (issuerMatch) result.issuer = issuerMatch[1].trim();
  if (productMatch) result.product_or_document = productMatch[1].trim();
  if (dateMatch) result.issued_date = dateMatch[1].trim();
  if (batchMatch) result.claims.push(`Batch: ${batchMatch[1].trim()}`);

  // Heuristic: split into lines and collect sentence-like claims
  const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const claimCandidates = [];

  lines.forEach(line => {
    // Skip metadata lines we've already parsed
    if (/(manufactured by|manufacturer|issuer|issued by|product id|product name|product|document|manufacture date|manufactured on|issued date|date|batch number|batch no\.?|batch)[:\-]/i.test(line)) return;

    // If the line contains assertive verbs or looks like a short sentence, treat as claim
    if (/\bis\b|\bhas\b|\bprovides\b|\bincludes\b|\bcontains\b|\bguarantee|\bmeets\b|\bcomplies\b/i.test(line) || line.length > 20) {
      claimCandidates.push(line.replace(/^[-\d\.\)\s]+/, '').trim());
    }
  });

  // If still no claims, fallback to the first few sentences
  if (claimCandidates.length === 0) {
    const sentences = normalized.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    sentences.slice(0, 6).forEach(s => claimCandidates.push(s));
  }

  result.claims = result.claims.concat(claimCandidates.map(s => s.replace(/\s+/g, ' ').trim()));

  return result;
}

// Robust text parser for plain-text certificates. Returns clean strings (empty if not present).
export function parseCertificateText(text) {
  if (!text) return { issuer: '', productId: '', batchNumber: '', issueDate: '' };
  const normalized = text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();
  const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);

  let issuer = '';
  let productId = '';
  let batchNumber = '';
  let issueDate = '';

  for (const line of lines) {
    let m;
    if (!issuer) {
      m = line.match(/^(?:issuer|issued by|issued-by|manufacturer|manufactured by)[:\-]?\s*(.+)$/i);
      if (m) issuer = m[1].trim();
    }

    if (!productId) {
      // Explicit product id or common code like PC-100
      m = line.match(/^(?:product id|product name|product|document)[:\-]?\s*([A-Z0-9][A-Z0-9\-\s]*)$/i);
      if (m) productId = m[1].trim().replace(/\s+/g, '-');
      else {
        const p = line.match(/(PC-[A-Z0-9\-]+)/i);
        if (p) productId = p[1].toUpperCase();
      }
    }

    if (!batchNumber) {
      m = line.match(/^(?:batch number|batch no\.?|batch)[:\-]?\s*([A-Z0-9\-\s]+)/i);
      if (m) batchNumber = m[1].trim().replace(/\s+/g, '-').toUpperCase();
    }

    if (!issueDate) {
      m = line.match(/^(?:issue date|issued date|manufacture date|manufactured on|date)[:\-]?\s*(.+)$/i);
      if (m) {
        const dstr = m[1].trim();
        const iso = dstr.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
        if (iso) issueDate = iso[1];
        else {
          const parsed = Date.parse(dstr);
          if (!isNaN(parsed)) {
            const dt = new Date(parsed);
            const y = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            issueDate = `${y}-${mm}-${dd}`;
          } else {
            issueDate = dstr;
          }
        }
      } else {
        const iso2 = line.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
        if (iso2) issueDate = iso2[1];
      }
    }

    if (issuer && productId && batchNumber && issueDate) break;
  }

  return { issuer: issuer || '', productId: productId || '', batchNumber: batchNumber || '', issueDate: issueDate || '' };
}

// Assumed blockchain verification function signature: verifyOnChain(hash) -> { status: 'verified'|'fake'|'partial', details?: string }
// We'll provide a mock verifyOnChain for demo that compares against a dummy set of hashes.
async function verifyOnChainMock(hash) {
  // In a real integration, call out to your chain or an indexer
  // For demo deterministic behaviour, classify based on first hex digit
  const first = hash[0];
  if (!first) return { status: 'Fake' };
  if ('0123'.includes(first)) return { status: 'Verified' };
  if ('4567'.includes(first)) return { status: 'Partially Verified' };
  return { status: 'Fake' };
}

// Verify claims: hash each claim and the whole object and compare on-chain (detailed per-item results)
export async function verifyClaimsDetailed(claimData) {
  if (!claimData) return [];

  const canonical = stableStringify(claimData);
  const fullHash = await sha256Hex(canonical);

  const results = [];

  const issuer = (claimData.issuer || '').trim();
  const issuerMatch = registry.issuers.some(i => i.toLowerCase() === issuer.toLowerCase());

  // meta row
  results.push({ type: 'meta', label: `Issuer: ${issuer || 'Unknown'}`, hash: fullHash, status: issuerMatch ? 'Verified' : 'Fake', details: issuerMatch ? 'Issuer recognized' : 'Issuer not recognized' });

  // product
  const productId = extractProductId(claimData);
  if (productId) {
    const ok = registry.productIds.includes(productId);
    const h = await sha256Hex(JSON.stringify({ product: productId }));
    results.push({ type: 'claim', label: `Product ID: ${productId}`, hash: h, status: ok ? 'Verified' : 'Fake', details: ok ? 'Product recognized' : 'Product not recognized' });
  }

  // batch
  const batch = extractBatchNumber(claimData);
  if (batch) {
    const ok = registry.batches.includes(batch);
    const h = await sha256Hex(JSON.stringify({ batch }));
    results.push({ type: 'claim', label: `Batch: ${batch}`, hash: h, status: ok ? 'Verified' : 'Fake', details: ok ? 'Batch recognized' : 'Batch not recognized' });
  }

  // date
  const date = extractIssueDate(claimData);
  if (date) {
    const ok = registry.issueDates.includes(date);
    const h = await sha256Hex(JSON.stringify({ date }));
    results.push({ type: 'claim', label: `Issued date: ${date}`, hash: h, status: ok ? 'Verified' : 'Fake', details: ok ? 'Date recognized' : 'Date not recognized' });
  }

  // Other textual claims
  for (const c of (claimData.claims || [])) {
    // Skip ones we already emitted
    if (/^Batch[: ]/i.test(c) || /Product ID[: ]/i.test(c)) continue;
    const h = await sha256Hex(JSON.stringify({ claim: c }));
    // Unverifiable textual claims are shown as Partially Verified
    results.push({ type: 'claim', label: c, hash: h, status: 'Partially Verified', details: 'Textual claim - not verifiable on-chain in demo' });
  }

  return results;
}

// Mock on-chain registry structured per requirements
const registry = {
  issuers: ['Acme Pharma Ltd'],
  productIds: ['PC-100', 'PC-200'],
  batches: ['BATCH-9999'],
  issueDates: ['2024-01-01']
};

function extractProductId(claimData) {
  if (!claimData) return null;
  const p = (claimData.product_or_document || '') || (claimData.productId || '');
  if (p && /PC-\w+/i.test(p)) return p.match(/PC-[A-Z0-9\-]+/i)[0].toUpperCase();
  // also accept productId field provided by parser
  if (claimData.productId && typeof claimData.productId === 'string' && /PC-\w+/i.test(claimData.productId)) return claimData.productId.match(/PC-[A-Z0-9\-]+/i)[0].toUpperCase();
  // search claims
  for (const c of (claimData.claims || [])) {
    const m = c.match(/(PC-[A-Z0-9\-]+)/i);
    if (m) return m[1].toUpperCase();
    const m2 = c.match(/product id[:\-]?\s*([A-Z0-9\-]+)/i);
    if (m2) return m2[1].toUpperCase();
  }
  return null;
}

function extractBatchNumber(claimData) {
  if (!claimData) return null;
  // prefer explicit parsed batchNumber
  if (claimData.batchNumber) return String(claimData.batchNumber).trim().replace(/\s+/g, '-').toUpperCase();
  if (claimData.batch || claimData.batch_number) return String(claimData.batch || claimData.batch_number).trim().replace(/\s+/g, '-').toUpperCase();
  for (const c of (claimData.claims || [])) {
    const m = c.match(/(BATCH[-\s]?[A-Z0-9]+)/i);
    if (m) return m[1].replace(/\s+/g, '-').toUpperCase();
    const m2 = c.match(/batch number[:\-]?\s*([A-Z0-9\-]+)/i);
    if (m2) return m2[1].toUpperCase();
  }
  return null;
}

function extractIssueDate(claimData) {
  if (!claimData) return null;
  const d = (claimData.issued_date || '') || (claimData.issueDate || '');
  if (d && /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(d)) return d.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/)[0];
  for (const c of (claimData.claims || [])) {
    const m = c.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
    if (m) return m[1];
  }
  return null;
}

function buildCertificateFromClaimData(claimData) {
  return {
    issuer: (claimData.issuer || '').trim(),
    productId: extractProductId(claimData) || '',
    batchNumber: extractBatchNumber(claimData) || '',
    issueDate: extractIssueDate(claimData) || ''
  };
}

export function verifyCertificate(certificateData, reg = registry) {
  const reasons = [];

  const issuer = (certificateData.issuer || '').trim();
  if (!issuer || !reg.issuers.includes(issuer)) {
    return { status: 'Fake', reasons: ['Issuer not found on chain'] };
  }

  // issuer exists, now validate other fields
  const productId = certificateData.productId;
  const batch = certificateData.batchNumber;
  const date = certificateData.issueDate;

  if (!productId) reasons.push('Product ID missing');
  else if (!reg.productIds.includes(productId)) reasons.push('Product ID not registered');

  if (!batch) reasons.push('Batch number missing');
  else if (!reg.batches.includes(batch)) reasons.push('Batch number not registered');

  if (!date) reasons.push('Issue date missing');
  else if (!reg.issueDates.includes(date)) reasons.push('Issue date not registered');

  if (reasons.length === 0) {
    return { status: 'Verified', reasons: ['All checks passed'] };
  }

  // issuer exists but some issues
  return { status: 'Partially Verified', reasons };
}

// Aggregate verification: returns a single status and reasons array for UI
export async function verifyClaims(claimData) {
  const cert = buildCertificateFromClaimData(claimData);
  return verifyCertificate(cert, registry);
}

// ----------------------
// React component
// ----------------------

export default function ClaimVerifier() {
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [claimJson, setClaimJson] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [extractedCount, setExtractedCount] = useState(0);
  const [extractMessage, setExtractMessage] = useState('');
  const fileRef = useRef(null);
  const formattedRef = useRef(null);
  // whether extract operation is enabled (helps debug missing button)
  const extractEnabled = !extracting && inputText && inputText.trim().length > 0;

  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    // Use FileReader (requirement) to read .txt files
    const reader = new FileReader();
    reader.onload = () => {
      setInputText(String(reader.result || ''));
      // clear previous extraction and verification state
      setClaimJson('');
      setResults([]);
      setExtractMessage('');
      setVerificationResult(null);
      setExtractedCount(0);
    };
    reader.onerror = (err) => {
      console.error('File read error', err);
      setInputText('');
    };
    reader.readAsText(f);
  }

  async function handleExtract() {
    setExtracting(true);
    setResults([]);
    setExtractMessage('');
    try {
      const data = await extractClaimsFromText(inputText);
      console.log('Extracted claims:', data);
      // always set claimJson so user can edit it even if empty
      const json = JSON.stringify(data, null, 2);
      setClaimJson(json);
      if (data && Array.isArray(data.claims) && data.claims.length > 0) {
        setExtractedCount(data.claims.length);
        setExtractMessage(`${data.claims.length} claim(s) extracted — JSON displayed below.`);
      } else {
        setExtractedCount(0);
        setExtractMessage('No claims detected — JSON displayed below for manual editing.');
      }
      // Auto-scroll to the formatted JSON block for visibility
      setTimeout(() => {
        if (formattedRef.current) formattedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } catch (err) {
      console.error(err);
      setClaimJson('');
      setExtractMessage('Extraction error — see console for details.');
    } finally {
      setExtracting(false);
    }
  }

  async function handleVerify() {
    console.log('Starting verification...');
    setVerifying(true);
    setResults([]);
    setVerificationResult(null);
    try {
      let parsed;
      try {
        parsed = JSON.parse(claimJson);
      } catch (e) {
        alert('Invalid JSON: please fix extracted claims before verifying.');
        setVerifying(false);
        return;
      }
      // detailed per-claim results
      const detailed = await verifyClaimsDetailed(parsed);
      console.log('Detailed verification:', detailed);
      setResults(detailed);
      // aggregate overall result
      const agg = await verifyClaims(parsed);
      console.log('Aggregate verification:', agg);
      setVerificationResult(agg);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  }

  function badgeFor(status) {
    if (status === 'Verified') return 'bg-green-100 text-green-800';
    if (status === 'Partially Verified') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-3">Claim Verifier 🔍</h2>

      <div className="mb-3">
        <label className="block text-sm font-medium text-slate-700 mb-1">Upload document (.txt)</label>
        <input ref={fileRef} type="file" accept=".txt" onChange={handleFile} className="mb-2" />
        {fileName && <div className="text-sm text-slate-500 mb-2">Loaded: {fileName}</div>}

        <label className="block text-sm font-medium text-slate-700 mb-1">or paste text</label>
        <textarea
          className="w-full rounded-md border p-2 h-32 text-sm font-mono"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Paste document text here..."
        />

        {/* Helpful instruction + prominent extract button (always visible) */}
        <div className="mt-3">
          <div className="text-sm text-slate-500 mb-2">Ready? Click <strong className="text-slate-700">🔍 Extract Claims</strong> to extract structured claims from the text.</div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <Button onClick={handleExtract} aria-label="Extract Claims" disabled={!extractEnabled || extracting} className={`${extractEnabled ? '' : 'opacity-75'}`}>
              {extracting ? 'Extracting…' : 'Extract Claims'}
            </Button>

            <Button variant="outline" onClick={() => { setInputText(''); setFileName(''); setClaimJson(''); setResults([]); setExtractMessage(''); setVerificationResult(null); setExtractedCount(0); if (fileRef.current) fileRef.current.value = null; }}>
              Clear
            </Button>
        </div>
        </div>
        {/* Readiness indicator to help debugging visibility */}
        <div className="mt-2 text-sm">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${extractEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {extractEnabled ? 'Ready to extract' : 'No input text — paste or upload a file'}
          </span>
          <span className="ml-3 text-xs text-slate-500">Input length: {inputText ? inputText.length : 0}</span>
        </div>
        {extractMessage && <div className="text-sm text-slate-500 mt-2">{extractMessage}</div>}
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-slate-700 mb-1">Extracted claims (editable JSON)</label>
        <textarea
          className="w-full rounded-md border p-2 h-48 text-sm font-mono"
          value={claimJson}
          onChange={e => setClaimJson(e.target.value)}
          placeholder="Extracted claims will appear here as JSON"
        />

        {claimJson && (() => {
          try {
            const parsed = JSON.parse(claimJson);
            return (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Formatted extracted JSON</label>

                </div>
                <pre ref={formattedRef} className="bg-slate-900 text-slate-100 p-3 rounded-md text-sm overflow-auto">{JSON.stringify(parsed, null, 2)}</pre>
                {/* quick debug: show last extracted object (visible to user) */}
                <div className="mt-2 text-xs text-slate-400">Last extracted: <code className="font-mono">{JSON.stringify(parsed, null, 0)}</code></div>

                {/* Prominent verify button (always visible when claims present) */}
                {extractedCount > 0 && (
                  <div className="mt-4">
                    <Button onClick={handleVerify} disabled={verifying} variant="default">
                      {verifying ? 'Verifying…' : 'Verify Truth'}
                    </Button>
                    <span className="ml-3 text-sm text-slate-500">Click to verify extracted claims on-chain (mock).</span>
                  </div>
                )}
              </div>
            );
          } catch (e) {
            return <div className="text-sm text-red-400 mt-2">Invalid JSON — fix before verifying</div>;
          }
        })()}


      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Verification results</h3>

        {/* Aggregate verification result */}
        {verificationResult ? (
          <div className="p-4 rounded border bg-slate-50 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-slate-700 font-medium">Overall status</div>
              </div>
              <div className="ml-4 flex flex-col items-end">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeFor(verificationResult.status)}`}>
                  {verificationResult.status}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 mt-2">
              <strong>Reasons:</strong>
              <ul className="list-disc list-inside mt-1">
                {verificationResult.reasons && verificationResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Integrate the Virtual Verification Assistant here */}
            <div className="mt-3">
              <VerificationAssistant verificationStatus={verificationResult.status} verificationReasons={verificationResult.reasons || []} />
            </div>

          </div>
        ) : (
          <div className="text-sm text-slate-500 mb-4">No verification performed yet.</div>
        )}

        <div className="space-y-2">
          {results.map((r, idx) => (
            <div key={idx} className="p-3 rounded border bg-slate-50 flex items-start justify-between">
              <div className="max-w-[70%]">
                <div className="text-sm text-slate-700 font-medium">{r.type === 'meta' ? r.label : 'Claim'}</div>
                <div className="text-sm text-slate-600 mt-1">{r.type === 'meta' ? (r.label + (r.details ? ` — ${r.details}` : '')) : r.label}</div>
                <div className="text-xs text-slate-400 mt-2 font-mono">Hash: {r.hash}</div>
              </div>
              <div className="ml-4 flex flex-col items-end">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeFor(r.status)}`}>
                  {r.status}
                </div>
                {r.details && <div className="text-xs text-slate-400 mt-1">{r.details}</div>}
              </div>
            </div>
          ))}
          {results.length === 0 && <div className="text-sm text-slate-500">No per-claim verification yet.</div>}
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        <strong>Tip:</strong> Replace <code>extractClaimsFromText</code> and <code>verifyOnChainMock</code> with real API/blockchain calls.
      </div>
    </div>
  );
}
