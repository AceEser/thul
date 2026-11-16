import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X, Download, Trash2, Loader2 } from "lucide-react";
import ToolLayout from "../components/ToolLayout.jsx";
import UploadArea from "../components/UploadArea.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { postFile, saveBlob, errorMessage, formatBytes } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

const EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX = 30;
const uid = () => Math.random().toString(36).slice(2);

export default function ImageToPDF() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const dragFrom = useRef(null);

  const add = (files) => setItems((prev) => {
    const room = MAX - prev.length;
    if (files.length > room) toast.error(`You can add up to ${MAX} images.`);
    return [...prev, ...files.slice(0, room).map((file) => ({ id: uid(), file, url: URL.createObjectURL(file) }))];
  });
  const remove = (id) => setItems((p) => { p.filter((x) => x.id === id).forEach((x) => URL.revokeObjectURL(x.url)); return p.filter((x) => x.id !== id); });
  const clear = () => { items.forEach((x) => URL.revokeObjectURL(x.url)); setItems([]); setProgress(0); };
  const move = (from, to) => setItems((p) => {
    if (to < 0 || to >= p.length) return p;
    const copy = [...p]; const [m] = copy.splice(from, 1); copy.splice(to, 0, m); return copy;
  });

  const convert = async () => {
    setBusy(true); setProgress(0);
    try {
      const fd = new FormData();
      items.forEach((i) => fd.append("files", i.file));
      const res = await postFile("/api/image-to-pdf", fd, setProgress);
      saveBlob(res.data, "thul-images.pdf");
      toast.success(`PDF created (${formatBytes(res.data.size)}).`);
    } catch (e) { toast.error(await errorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <ToolLayout id="image-to-pdf">
      <UploadArea multiple extensions={EXT} accept=".jpg,.jpeg,.png,.webp" onFiles={add} label="Drop images here or click to browse"
        hint={`JPG, PNG, WEBP · up to 15 MB each · max ${MAX} images`} />
      {items.length > 0 && (
        <div className="card panel">
          <div className="muted small">{items.length} image{items.length > 1 ? "s" : ""} · drag to reorder or use the arrows. Page order = image order.</div>
          <div className="thumbs">
            {items.map((it, i) => (
              <div key={it.id} className="thumb" draggable
                onDragStart={() => (dragFrom.current = i)} onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragFrom.current !== null) move(dragFrom.current, i); dragFrom.current = null; }}>
                <img src={it.url} alt={it.file.name} />
                <span className="tn">{i + 1}</span>
                <div className="tools">
                  <button disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move earlier"><ArrowLeft size={14} /></button>
                  <button onClick={() => remove(it.id)} aria-label="Remove"><X size={14} /></button>
                  <button disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label="Move later"><ArrowRight size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          {busy && <ProgressBar value={progress} label={progress < 100 ? "Uploading…" : "Creating PDF…"} />}
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button className="btn btn-primary" disabled={busy} onClick={convert}>
              {busy ? <Loader2 className="spin" size={18} /> : <Download size={18} />} Convert &amp; download PDF
            </button>
            <button className="btn" disabled={busy} onClick={clear}><Trash2 size={18} /> Clear all</button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
