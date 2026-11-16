export default function ProgressBar({ value, label }) {
  return (
    <div className="progress-wrap">
      <div className="progress-label"><span>{label}</span><span>{value}%</span></div>
      <div className="progress"><div style={{ width: `${value}%` }} /></div>
    </div>
  );
}
