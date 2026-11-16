import { useState } from "react";
import { Download, Loader2, RotateCcw, Info, FileText } from "lucide-react";
import ToolLayout from "../components/ToolLayout.jsx";
import UploadArea from "../components/UploadArea.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { postFile, saveBlob, filenameFrom, errorMessage, formatBytes } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

export default function PDFToWord() {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(null);

  const convert = async () => {
    setBusy(true); setProgress(0); setDone(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await postFile("/api/pdf-to-word", fd, setProgress);
      const name = filenameFrom(res, "document.docx");
      setDone({ blob: res.data, name, pages: res.headers["x-pages"] });
      saveBlob(res.data, name);
      toast.success("Converted! Your download has started.");
    } catch (e) { toast.error(await errorMessage(e)); }
    finally { setBusy(false); }
  };
  const reset = () => { setFile(null); setDone(null); setProgress(0); };

  return (
    <ToolLayout id="pdf-to-word">
      <div className="notice warn" style={{ marginBottom: 18 }}>
        <Info size={18} />
        <span>THUL extracts selectable text and basic formatting (bold, italic, size, colour). <b>Scanned PDFs need OCR</b> and are not supported, and complex layouts (tables, columns, images) may not convert perfectly.</span>
      </div>
      {!file ? <UploadArea extensions={[".pdf"]} accept=".pdf,application/pdf" maxMB={30} onFiles={([f]) => setFile(f)} label="Drop a PDF here or click to browse" /> : (
        <div className="card panel">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <FileText size={32} color="var(--b1)" />
            <div><b>{file.name}</b><div className="muted small">{formatBytes(file.size)}</div></div>
          </div>
          {busy && <ProgressBar value={progress} label={progress < 100 ? "Uploading…" : "Extracting text and building DOCX…"} />}
          {done && <div className="notice"><Info size={18} /><span>Done – {done.pages} page(s) converted.</span></div>}
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" disabled={busy} onClick={convert}>
              {busy ? <Loader2 className="spin" size={18} /> : <FileText size={18} />} Convert to Word
            </button>
            {done && <button className="btn" onClick={() => saveBlob(done.blob, done.name)}><Download size={18} /> Download again</button>}
            <button className="btn" disabled={busy} onClick={reset}><RotateCcw size={18} /> Reset</button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
