import { useEffect, useState } from "react";
import { Download, Loader2, RotateCcw, Repeat } from "lucide-react";
import ToolLayout from "../components/ToolLayout.jsx";
import UploadArea from "../components/UploadArea.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { postFile, saveBlob, filenameFrom, errorMessage, formatBytes } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

const EXT = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"];
const FORMATS = [["jpg", "JPG / JPEG"], ["png", "PNG"], ["webp", "WEBP"], ["bmp", "BMP"], ["tiff", "TIFF"]];

export default function ImageConverter() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fmt, setFmt] = useState("png");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // {blob,url,name,size}

  useEffect(() => () => { preview && URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { result && URL.revokeObjectURL(result.url); }, [result]);

  const pick = ([f]) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); };
  const reset = () => { setFile(null); setPreview(null); setResult(null); setProgress(0); };

  const convert = async () => {
    setBusy(true); setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("output_format", fmt); fd.append("quality", quality);
      const res = await postFile("/api/image-convert", fd, setProgress);
      setResult({ blob: res.data, url: URL.createObjectURL(res.data), name: filenameFrom(res, `converted.${fmt}`), size: res.data.size });
      toast.success("Image converted!");
    } catch (e) { toast.error(await errorMessage(e)); }
    finally { setBusy(false); }
  };

  const lossy = fmt === "jpg" || fmt === "webp";
  return (
    <ToolLayout id="image-converter">
      {!file ? <UploadArea extensions={EXT} accept=".jpg,.jpeg,.png,.webp,.bmp,.tif,.tiff" onFiles={pick} /> : (
        <div className="card panel">
          <div className="compare">
            <div className="preview"><h4>Original · {file.name} · {formatBytes(file.size)}</h4><img src={preview} alt="Original" /></div>
            {result && <div className="preview"><h4>Converted · {formatBytes(result.size)}</h4><img src={result.url} alt="Converted" /></div>}
          </div>
          <div className="row">
            <label className="field">Output format
              <select value={fmt} onChange={(e) => { setFmt(e.target.value); setResult(null); }}>
                {FORMATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            {lossy && (
              <label className="field">Quality: {quality}
                <input type="range" min="10" max="100" value={quality} onChange={(e) => { setQuality(+e.target.value); setResult(null); }} />
              </label>
            )}
          </div>
          {busy && <ProgressBar value={progress} label={progress < 100 ? "Uploading…" : "Converting…"} />}
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" disabled={busy} onClick={convert}>
              {busy ? <Loader2 className="spin" size={18} /> : <Repeat size={18} />} Convert
            </button>
            {result && <button className="btn" onClick={() => saveBlob(result.blob, result.name)}><Download size={18} /> Download</button>}
            <button className="btn" disabled={busy} onClick={reset}><RotateCcw size={18} /> Reset</button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
