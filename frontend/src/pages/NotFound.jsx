import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="container center" style={{ padding: "100px 0" }}>
      <h1 className="grad" style={{ fontSize: "5rem" }}>404</h1>
      <p className="muted">That page doesn't exist.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Back to home</Link>
    </div>
  );
}
