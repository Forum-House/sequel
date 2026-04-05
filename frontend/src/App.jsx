import { useMemo, useState } from "react";

const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost/api").replace(/\/$/, "");

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed (${response.status})`);
  }
  return data;
}

function App() {
  const [url, setUrl] = useState("");
  const [shortened, setShortened] = useState(null);
  const [shortCode, setShortCode] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shortLink = useMemo(() => {
    if (!shortened?.short_url) return "";
    return shortened.short_url;
  }, [shortened]);

  const handleShorten = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api("/shorten", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      setShortened(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStats = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api(`/stats/${shortCode.trim()}`);
      setStats(result);
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="layout">
      <section className="hero">
        <p className="eyebrow">Hackathon URL Platform</p>
        <h1>ShortFuse</h1>
        <p className="lede">Create tiny links, monitor click stats, and test production resilience from one interface.</p>
      </section>

      <section className="panel grid">
        <article className="card">
          <h2>Shorten URL</h2>
          <form onSubmit={handleShorten} className="form">
            <label htmlFor="url-input">Original URL</label>
            <input
              id="url-input"
              type="url"
              required
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/really/long/path"
            />
            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Generate short code"}</button>
          </form>
          {shortLink && (
            <div className="result">
              <p>Short URL</p>
              <a href={shortLink} target="_blank" rel="noreferrer">{shortLink}</a>
              <small>Code: {shortened.code}</small>
            </div>
          )}
        </article>

        <article className="card">
          <h2>Get Stats</h2>
          <form onSubmit={handleStats} className="form">
            <label htmlFor="code-input">Short code</label>
            <input
              id="code-input"
              type="text"
              required
              value={shortCode}
              onChange={(event) => setShortCode(event.target.value)}
              placeholder="abc123"
            />
            <button type="submit" disabled={loading}>{loading ? "Loading..." : "Fetch stats"}</button>
          </form>
          {stats && (
            <div className="result">
              <p>Original URL</p>
              <a href={stats.original_url} target="_blank" rel="noreferrer">{stats.original_url}</a>
              <small>Clicks: {stats.click_count}</small>
              <small>Created: {new Date(stats.created_at).toLocaleString()}</small>
            </div>
          )}
        </article>
      </section>

      {error && <p className="error">{error}</p>}
    </main>
  );
}

export default App;
