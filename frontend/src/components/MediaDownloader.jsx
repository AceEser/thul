import { useState } from "react";
import { Download, Loader2, RotateCcw, Search, ShieldAlert } from "lucide-react";
import ProgressBar from "./ProgressBar.jsx";
import useJob from "../hooks/useJob.js";
import { API_BASE, api, errorMessage, formatBytes } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

/** Shared UI for the YouTube and Instagram downloaders. platform = "youtube" | "instagram" */
export default function MediaDownloader({ platform, placeholder, notice }) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState(null);
  const [quality, setQuality] = useState("best");
  const [fetching, setFetching] = useState(false);
  const { job, starting, start, reset: resetJob } = useJob();

  const fetchInfo = async (e) => {
    e?.preventDefault();
    setInfo(null); resetJob(); setFetching(true);
    try {
      const { data } = await api.post(`/api/${platform}/info`, { url });
      setInfo(data);
      setQuality(data.qualities?.some((q) => q.id === "720") ? "720" : "best");
    } catch (err) { toast.error(await errorMessage(err)); }
    finally { setFetching(false); }
  };
  const download = () => start(`/api/${platform}/download`, platform === "youtube" ? { url, quality } : { url });
  const reset = () => { setUrl(""); setInfo(null); resetJob(); };

  const working = starting || (job && (job.status === "queued" || job.status === "processing"));
  return (
    <>
      <div className="notice warn" style={{ marginBottom: 18 }}><ShieldAlert size={18} /><span>{notice}</span></div>
      <form className="card urlbar" onSubmit={fetchInfo}>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={placeholder} required maxLength={500} />
        <button className="btn btn-primary" disabled={fetching || working || !url.trim()}>
          {fetching ? <Loader2 className="spin" size={18} /> : <Search size={18} />} Fetch info
        </button>
      </form>

      {info && (
        <div className="card panel">
          <div className="media">
            {info.thumbnail && <img src={info.thumbnail} alt="" referrerPolicy="no-referrer" />}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <h3>{info.title}</h3>
              <div className="muted small">{[info.uploader, info.duration_text].filter(Boolean).join(" · ")}</div>
              {info.description && <p className="muted small">{info.description}</p>}
              {info.qualities && (
                <label className="field" style={{ marginTop: 8, maxWidth: 280 }}>Format
                  <select value={quality} onChange={(e) => setQuality(e.target.value)} disabled={working}>
                    {info.qualities.map((q) => <option key={q.id} value={q.id}>{q.label}</option>)}
                  </select>
                </label>
              )}
              {info.ffmpeg === false && <div className="muted small">FFmpeg not found – higher qualities may be limited. See README.</div>}
            </div>
          </div>

          {job && job.status !== "error" && job.status !== "finished" && <ProgressBar value={job.progress || 0} label={job.message || "Working…"} />}
          {job?.status === "error" && <div className="notice warn"><ShieldAlert size={18} /><span>{job.error}</span></div>}
          {job?.status === "finished" && (
            <div className="notice"><Download size={18} /><span>Ready: <b>{job.filename}</b> ({formatBytes(job.size)}). The file is deleted from our server shortly after processing.</span></div>
          )}

          <div className="btn-row" style={{ marginTop: 0 }}>
            {job?.status === "finished" ? (
              <a className="btn btn-primary" href={`${API_BASE}/api/jobs/${job.id}/file`} download><Download size={18} /> Download file</a>
            ) : (
              <button className="btn btn-primary" disabled={working} onClick={download}>
                {working ? <Loader2 className="spin" size={18} /> : <Download size={18} />} {working ? "Processing…" : "Prepare download"}
              </button>
            )}
            <button className="btn" onClick={reset} disabled={working}><RotateCcw size={18} /> Reset</button>
          </div>
        </div>
      )}
    </>
  );
}
