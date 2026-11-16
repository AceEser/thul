import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getTool } from "../tools.js";

/** Shared page frame for every tool: header, icon, description. */
export default function ToolLayout({ id, children }) {
  const tool = getTool(id);
  const Icon = tool.icon;
  return (
    <div className="container tool-page">
      <Link to="/tools" className="back"><ArrowLeft size={16} /> All tools</Link>
      <div className="tool-head" style={{ "--accent": tool.accent }}>
        <span className="tool-icon big"><Icon size={32} /></span>
        <div>
          <h1>{tool.name}</h1>
          <p className="muted">{tool.description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
