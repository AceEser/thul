import { Link } from "react-router-dom";
import { Rocket, ShieldCheck, Zap, Gift, Mail } from "lucide-react";
import ToolsSection from "../components/ToolsSection.jsx";

const FAQ = [
  ["Is THUL really free?", "Yes. Every tool is free with no subscription, no payment and no registration."],
  ["Are my files kept on your server?", "No. Uploaded and processed files live in temporary folders and are automatically deleted shortly after processing."],
  ["Can I download any video?", "No. Downloaders only work for public content that you own or are authorised to download, and availability depends on each platform's current rules."],
  ["Why did my PDF to Word conversion come out empty?", "Scanned PDFs contain images, not text, and need OCR, which THUL does not include. Text-based PDFs convert best."],
  ["Which devices are supported?", "THUL works on desktops, laptops, tablets and phones in any modern browser."],
];

function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 400 340" role="img" aria-label="Illustration of tools">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#3b82f6" /></linearGradient>
        <linearGradient id="hg2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#3b82f6" stopOpacity=".9" /><stop offset="1" stopColor="#06b6d4" stopOpacity=".9" /></linearGradient>
      </defs>
      <circle cx="200" cy="170" r="140" fill="url(#hg)" opacity=".15" />
      <rect x="95" y="70" width="210" height="190" rx="28" fill="url(#hg)" />
      <path d="M150 120h100M200 120v90" stroke="#fff" strokeWidth="22" strokeLinecap="round" fill="none" />
      <rect x="40" y="40" width="96" height="70" rx="16" fill="url(#hg2)" opacity=".95" />
      <path d="M58 92l22-26 16 18 10-10 14 18z" fill="#fff" opacity=".9" /><circle cx="108" cy="62" r="7" fill="#fff" />
      <rect x="280" y="190" width="86" height="100" rx="16" fill="#fff" opacity=".95" />
      <rect x="294" y="206" width="58" height="8" rx="4" fill="#8b5cf6" /><rect x="294" y="224" width="44" height="8" rx="4" fill="#cbd5e1" /><rect x="294" y="240" width="52" height="8" rx="4" fill="#cbd5e1" /><rect x="294" y="256" width="36" height="8" rx="4" fill="#cbd5e1" />
      <circle cx="70" cy="250" r="30" fill="url(#hg2)" /><path d="M62 238l22 12-22 12z" fill="#fff" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <section className="container hero">
        <div>
          <span className="badge">✨ 100% free · No sign-up · Private</span>
          <h1>Everything You Need. <span className="grad">All in One Place.</span></h1>
          <p>Convert, compress, resize, and download your files effortlessly with THUL. Simple, fast, secure, and completely free.</p>
          <a href="#tools" className="btn btn-primary"><Rocket size={18} /> Explore Tools</a>
        </div>
        <HeroArt />
      </section>

      <ToolsSection id="tools" />

      <section className="container section">
        <div className="features">
          <div className="card"><Zap size={28} /><h3>Fast</h3><p className="muted">Optimised processing so your files are ready in seconds.</p></div>
          <div className="card"><ShieldCheck size={28} /><h3>Private</h3><p className="muted">Files are processed in temporary folders and automatically deleted.</p></div>
          <div className="card"><Gift size={28} /><h3>Free forever</h3><p className="muted">No payments, subscriptions or accounts. Ever.</p></div>
        </div>
      </section>

      <section className="container section" style={{ maxWidth: 820 }}>
        <h2 style={{ marginBottom: 20 }}>Frequently asked <span className="grad">questions</span></h2>
        {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </section>

      <section id="contact" className="container section">
        <div className="card center" style={{ padding: 40 }}>
          <Mail size={32} color="var(--b1)" />
          <h2>Get in touch</h2>
          <p className="muted">Questions, ideas or a tool you would like to see? We would love to hear from you.</p>
          <a className="btn btn-primary" href="mailto:sawmamal63@gmail.com">sawmamal63@gmail.com</a>
          <Link to="/feedback" className="muted small">or leave anonymous feedback →</Link>
        </div>
      </section>
    </>
  );
}
