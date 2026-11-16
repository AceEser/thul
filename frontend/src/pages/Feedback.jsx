import { useCallback, useEffect, useState } from "react";
import { Star } from "lucide-react";
import FeedbackForm from "../components/FeedbackForm.jsx";
import { api } from "../services/api.js";

export default function Feedback() {
  const [stats, setStats] = useState(null);
  const load = useCallback(() => api.get("/api/feedback/stats").then((r) => setStats(r.data)).catch(() => setStats(null)), []);
  useEffect(() => { load(); }, [load]);

  const avg = stats?.average || 0;
  const summary = !stats?.total ? "No ratings yet – be the first!" : avg >= 4.5 ? "Users love THUL." : avg >= 3.5 ? "Most users are happy with THUL." : avg >= 2.5 ? "Mixed feedback – we're working on it." : "We know we have work to do.";
  return (
    <div className="container prose" style={{ maxWidth: 980 }}>
      <h1>Feedback &amp; <span className="grad">ratings</span></h1>
      <p style={{ marginBottom: 24 }}>Rating is completely optional. No account needed.</p>
      <div className="two">
        <FeedbackForm onSubmitted={load} />
        <div className="card">
          <h3>What people think</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "12px 0" }}>
            <span className="grad" style={{ fontSize: "2.8rem", fontWeight: 800 }}>{avg ? avg.toFixed(1) : "–"}</span>
            <div>
              <div className="stars">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={20} className={n <= Math.round(avg) ? "on" : ""} />)}</div>
              <div className="muted small">{stats?.total || 0} rating{stats?.total === 1 ? "" : "s"}</div>
            </div>
          </div>
          <p className="muted">{summary}</p>
          {stats && [5, 4, 3, 2, 1].map((n) => (
            <div className="bar" key={n}>
              <span>{n}★</span>
              <div className="progress"><div style={{ width: `${stats.total ? (stats.distribution[n] / stats.total) * 100 : 0}%` }} /></div>
              <span className="muted">{stats.distribution[n]}</span>
            </div>
          ))}
          {stats?.recent?.map((c, i) => <div className="quote" key={i}>“{c.comment}” <span className="muted">– {c.rating}★</span></div>)}
        </div>
      </div>
    </div>
  );
}
