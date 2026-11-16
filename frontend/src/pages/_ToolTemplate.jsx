// TEMPLATE for a new tool page. Copy to e.g. MyTool.jsx, then add an entry to src/tools.js
// (the entry's `id` must match the id passed to <ToolLayout>). The router/homepage/search pick it up automatically.
import { useState } from "react";
import ToolLayout from "../components/ToolLayout.jsx";
import { api, errorMessage } from "../services/api.js";
import { useToast } from "../hooks/useToast.jsx";

export default function ToolTemplate() {
  const toast = useToast();
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const run = async () => {
    try { setOut((await api.post("/api/example-echo", { text })).data.echo); }
    catch (e) { toast.error(await errorMessage(e)); }
  };
  return (
    <ToolLayout id="my-tool">
      <div className="card panel">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary" onClick={run}>Run</button>
        {out && <p>{out}</p>}
      </div>
    </ToolLayout>
  );
}
