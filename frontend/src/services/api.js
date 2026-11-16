import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "";
export const api = axios.create({ baseURL: API_BASE });

const detailText = (d) => (typeof d === "string" ? d : Array.isArray(d) ? d.map((x) => x.msg).join(", ") : "Request failed.");

/** Turns any axios error (including blob responses) into a readable message. */
export async function errorMessage(err) {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try { return detailText(JSON.parse(await data.text()).detail); } catch { /* fall through */ }
  }
  if (data?.detail) return detailText(data.detail);
  if (err?.code === "ERR_NETWORK") return "Cannot reach the THUL server. Make sure the backend is running on port 8000.";
  return err?.message || "Something went wrong.";
}

/** POST multipart form data and receive a file back. */
export const postFile = (url, formData, onProgress) =>
  api.post(url, formData, {
    responseType: "blob",
    onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
  });

export function filenameFrom(res, fallback) {
  const cd = res.headers?.["content-disposition"] || "";
  const star = /filename\*=UTF-8''([^;]+)/i.exec(cd);
  if (star) return decodeURIComponent(star[1]);
  const plain = /filename="?([^";]+)"?/i.exec(cd);
  return plain ? plain[1] : fallback;
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function formatBytes(n) {
  if (n == null) return "–";
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 ** 2).toFixed(2)} MB`;
}
