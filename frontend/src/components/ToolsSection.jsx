import { useState } from "react";
import { Search } from "lucide-react";
import ToolCard from "./ToolCard.jsx";
import { CATEGORIES, searchTools } from "../tools.js";

export default function ToolsSection({ id }) {
  const [q, setQ] = useState("");
  const results = searchTools(q);
  return (
    <section id={id} className="container section">
      <div className="section-head">
        <h2>All <span className="grad">Tools</span></h2>
        <label className="search">
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools (e.g. pdf, resize, youtube)…" />
        </label>
      </div>
      {results.length === 0 && <p className="muted center">No tools match “{q}”.</p>}
      {CATEGORIES.map((cat) => {
        const items = results.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="cat">
            <h3 className="cat-title">{cat}</h3>
            <div className="grid">{items.map((t) => <ToolCard key={t.id} tool={t} />)}</div>
          </div>
        );
      })}
    </section>
  );
}
