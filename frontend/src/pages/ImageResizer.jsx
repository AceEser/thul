import { useEffect, useState } from "react";
import { Download, Loader2, RotateCcw, Lock, Unlock, Minimize2 } from "lucide-react";
import ToolLayout from "../components/ToolLayout.jsx";
import UploadArea from "../components/UploadArea.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { postFile, saveBlob, filenameFrom, errorMessage, formatBytes } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

const EXT = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"];

export default function ImageResizer() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [orig, setOrig] = useState({ w: 0, h: 0 });
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [lock, setLock] = useState(true);
  const [percent, setPercent] = useState(100);
  const [quality, setQuality] = useState(82);
  const [fmt, setFmt] = useState("original");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => () => { preview && URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { result && URL.revokeObjectURL(result.url); }, [result]);

  const pick = ([f]) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => { setOrig({ w: img.naturalWidth, h: img.naturalHeight }); setW(img.naturalWidth); setH(img.naturalHeight); setPercent(100); };
    img.src = url;
    setFile(f); setPreview(url); setResult(null);
  };
  const reset = () => { setFile(null); setPreview(null); setResult(null); setProgress(0); };

  const ratio = orig.h ? orig.w / orig.h : 1;
  const changeW = (v) => { setResult(null); setW(v); if (lock && v) setH(Math.max(1, Math.round(v / ratio))); if (orig.w && v) setPercent(Math.round((v / orig.w) * 100)); };
  const changeH = (v) => { setResult(null); setH(v); if (lock && v) setW(Math.max(1, Math.round(v * ratio))); if (orig.h && v) setPercent(Math.round((v / orig.h) * 100)); };
  const changePercent = (p) => { setResult(null); setPercent(p); setW(Math.max(1, Math.round(orig.w * p / 100))); setH(Math.max(1, Math.round(orig.h * p / 100))); };

  const run = async () => {
    if (!w || !h) return toast.error("Enter a width and height.");
    setBusy(true); setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("width", w); fd.append("height", h); fd.append("quality", quality); fd.append("output_format", fmt);
      const res = await postFile("/api/image-resize", fd, setProgress);
      setResult({ blob: res.data, url: URL.createObjectURL(res.data), name: filenameFrom(res, "resized.jpg"), size: res.data.size,
        w: res.headers["x-width"], h: res.headers["x-height"] });
      toast.success("Image processed!");
    } catch (e) { toast.error(await errorMessage(e)); }
    finally { setBusy(false); }
  };

  const saved = result ? Math.round((1 - result.size / file.size) * 100) : 0;
  return (
    <ToolLayout id="image-resizer">
      {!file ? <UploadArea extensions={EXT} accept=".jpg,.jpeg,.png,.webp,.bmp,.tif,.tiff" onFiles={pick} /> : (
        <div className="card panel">
          <div className="compare">
            <div className="preview"><h4>Original · {orig.w}×{orig.h} · {formatBytes(file.size)}</h4><img src={preview} alt="Original" /></div>
            {result && <div className="preview"><h4>Result · {result.w}×{result.h} · {formatBytes(result.size)}</h4><img src={result.url} alt="Result" /></div>}
          </div>
          <div className="row">
            <label className="field">Width (px)<input type="number" min="1" max="10000" value={w} onChange={(e) => changeW(e.target.value ? +e.target.value : "")} /></label>
            <button className="icon-btn lock-btn" onClick={() => setLock(!lock)} aria-label="Lock aspect ratio" title={lock ? "Aspect ratio locked" : "Aspect ratio unlocked"}>
              {lock ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
            <label className="field">Height (px)<input type="number" min="1" max="10000" value={h} onChange={(e) => changeH(e.target.value ? +e.target.value : "")} /></label>
          </div>
          <label className="field">Scale: {percent}%
            <input type="range" min="5" max="200" value={Math.min(200, percent)} onChange={(e) => changePercent(+e.target.value)} />
          </label>
          <div className="row">
            <label className="field">Quality: {quality}
              <input type="range" min="20" max="100" value={quality} onChange={(e) => { setQuality(+e.target.value); setResult(null); }} />
            </label>
            <label className="field">Output format
              <select value={fmt} onChange={(e) => { setFmt(e.target.value); setResult(null); }}>
                <option value="original">Keep original</option><option value="jpg">JPG</option><option value="webp">WEBP (smallest)</option><option value="png">PNG</option>
              </select>
            </label>
          </div>
          {result && (
            <div className="stats">
              <div className="stat"><b>{formatBytes(file.size)}</b><span>Original size</span></div>
              <div className="stat"><b>{formatBytes(result.size)}</b><span>New size</span></div>
              <div className={`stat ${saved > 0 ? "good" : ""}`}><b>{saved > 0 ? `${saved}%` : "0%"}</b><span>{saved > 0 ? "Saved" : "No saving – try WEBP or lower quality"}</span></div>
            </div>
          )}
          {busy && <ProgressBar value={progress} label={progress < 100 ? "Uploading…" : "Processing…"} />}
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" disabled={busy} onClick={run}>
              {busy ? <Loader2 className="spin" size={18} /> : <Minimize2 size={18} />} Resize &amp; compress
            </button>
            {result && <button className="btn" onClick={() => saveBlob(result.blob, result.name)}><Download size={18} /> Download</button>}
            <button className="btn" disabled={busy} onClick={reset}><RotateCcw size={18} /> Reset</button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
