import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useToast } from "../hooks/useToast.jsx";
import { formatBytes } from "../services/api.js";

/** Drag-and-drop / click upload box with extension and size validation. */
export default function UploadArea({ onFiles, accept, extensions, multiple = false, maxMB = 15, label, hint }) {
  const input = useRef(null);
  const [drag, setDrag] = useState(false);
  const toast = useToast();

  const handle = (list) => {
    const ok = [];
    for (const f of Array.from(list)) {
      const ext = "." + f.name.split(".").pop().toLowerCase();
      if (!extensions.includes(ext)) toast.error(`"${f.name}" is not supported. Allowed: ${extensions.join(", ")}`);
      else if (f.size > maxMB * 1024 * 1024) toast.error(`"${f.name}" is ${formatBytes(f.size)} – the limit is ${maxMB} MB.`);
      else ok.push(f);
    }
    if (ok.length) onFiles(multiple ? ok : ok.slice(0, 1));
  };

  return (
    <div
      className={`dropzone ${drag ? "drag" : ""}`}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      role="button" tabIndex={0}
    >
      <input ref={input} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
      <UploadCloud size={40} />
      <strong>{label || "Drag & drop or click to upload"}</strong>
      <span className="muted">{hint || `${extensions.join(", ")} · up to ${maxMB} MB each`}</span>
    </div>
  );
}
