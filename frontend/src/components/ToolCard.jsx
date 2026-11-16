import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ToolCard({ tool }) {
  const Icon = tool.icon;
  return (
    <Link to={tool.path} className="card tool-card" style={{ "--accent": tool.accent }}>
      <span className="tool-icon"><Icon size={26} /></span>
      <h3>{tool.name}</h3>
      <p className="muted">{tool.description}</p>
      <span className="tool-open">Open Tool <ArrowRight size={16} /></span>
    </Link>
  );
}
