import { Mail } from "lucide-react";
export default function About() {
  return (
    <div className="container prose">
      <h1>About <span className="grad">THUL</span></h1>
      <p>THUL is a free, all-in-one online toolbox for everyday file tasks: converting images, building PDFs, turning PDFs into Word documents, compressing and resizing pictures, and downloading videos you are allowed to save.</p>
      <h2>Our principles</h2>
      <ul>
        <li><b>Free</b> – no payments, subscriptions or compulsory registration.</li>
        <li><b>Private</b> – files are processed in temporary folders and deleted automatically.</li>
        <li><b>Respectful</b> – we follow platform rules and copyright, and never ask for social media credentials.</li>
      </ul>
      <div id="contact" className="card" style={{ marginTop: 32 }}>
        <h2 style={{ marginTop: 0 }}><Mail size={20} style={{ verticalAlign: "-3px" }} /> Contact</h2>
        <p>Email us at <a href="mailto:sawmamal63@gmail.com" className="grad">sawmamal63@gmail.com</a> .</p>
      </div>
    </div>
  );
}
