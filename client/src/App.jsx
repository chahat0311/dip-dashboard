import { useEffect, useState } from 'react';
import { apiBaseUrl, describeHealth, fetchHealth } from './health.js';

export default function App() {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .catch((err) => ({ error: err.message }))
      .then((r) => {
        if (!cancelled) setResult(r);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const checkAgain = () => {
    setResult(null);
    setAttempt((n) => n + 1);
  };

  const view = describeHealth(result);

  return (
    <main className="page">
      <h1>DIP Dashboard</h1>
      <p className="subtitle">Walking skeleton: React → Express /health → PostgreSQL</p>

      <section className={`card ${view.tone}`} aria-live="polite">
        <h2>{view.label}</h2>
        <dl>
          <dt>API</dt>
          <dd><code>{apiBaseUrl()}/health</code></dd>
          {result?.httpStatus !== undefined && (<><dt>HTTP status</dt><dd>{result.httpStatus}</dd></>)}
          {result?.dbTime && (<><dt>Database time</dt><dd>{new Date(result.dbTime).toLocaleString()}</dd></>)}
          {result?.latencyMs !== undefined && (<><dt>DB round trip</dt><dd>{result.latencyMs} ms</dd></>)}
          {result?.error && (<><dt>Error</dt><dd>{result.error}</dd></>)}
        </dl>
        <button type="button" onClick={checkAgain}>Check again</button>
      </section>
    </main>
  );
}
