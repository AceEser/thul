export function Privacy() {
  return (
    <div className="container prose">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>Files you upload</h2>
      <p>Files are sent to our server only to perform the tool you chose. They are stored in temporary, uniquely named folders, never opened by people, never shared, and deleted automatically right after processing or after a short time limit (20 minutes by default). Downloaded media files are likewise temporary.</p>
      <h2>Accounts and credentials</h2>
      <p>THUL has no accounts. We never ask for or store passwords, cookies or social media credentials.</p>
      <h2>Feedback</h2>
      <p>If you submit a rating or comment, we store the rating, the comment and a timestamp. We do not store your name, email or IP address with it. Feedback is optional.</p>
      <h2>Technical data</h2>
      <p>For abuse prevention, your IP address may be held temporarily in memory to apply rate limits. It is not written to a database.</p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="container prose">
      <h1>Terms &amp; Conditions</h1>
      <p>By using THUL you agree to these terms.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Only upload or download content that you own or have permission to use.</li>
        <li>You are responsible for complying with copyright law and the terms of third-party platforms such as YouTube and Instagram.</li>
        <li>Do not use THUL to bypass access restrictions, download private content, or abuse the service.</li>
      </ul>
      <h2>No guarantees</h2>
      <p>THUL is provided “as is”, free of charge. Conversion quality and the availability of third-party media can vary and may change without notice. Not every video can be downloaded.</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, THUL is not liable for any loss arising from use of the service. Keep your own backups of important files.</p>
    </div>
  );
}
