/**
 * TOOL REGISTRY – the single place that defines every tool on the site.
 * The homepage cards, search, "All Tools" page, navigation and routes are all generated from this list.
 *
 * To ADD A NEW TOOL later:
 *   1. Create src/pages/MyTool.jsx (copy src/pages/_ToolTemplate.jsx)
 *   2. Add an entry below
 *   3. (If it needs a server) add a router file in backend/app/routers/ (see _template.py)
 */
import { lazy } from "react";
import { Images, Repeat, FileText, Scaling, Instagram, Youtube } from "lucide-react";

export const CATEGORIES = ["Image Tools", "PDF Tools", "Video Downloaders"];

export const TOOLS = [
  {
    id: "image-converter", path: "/tools/image-converter", name: "Image Format Converter", category: "Image Tools",
    description: "Convert between JPG, PNG, WEBP, BMP and TIFF with adjustable quality.",
    icon: Repeat, accent: "#8b5cf6", keywords: ["jpg", "png", "webp", "bmp", "tiff", "convert"],
    component: lazy(() => import("./pages/ImageConverter.jsx")),
  },
  {
    id: "image-resizer", path: "/tools/image-resizer", name: "Image Compressor & Resizer", category: "Image Tools",
    description: "Shrink dimensions and file size while keeping your images sharp.",
    icon: Scaling, accent: "#06b6d4", keywords: ["compress", "resize", "reduce", "size"],
    component: lazy(() => import("./pages/ImageResizer.jsx")),
  },
  {
    id: "image-to-pdf", path: "/tools/image-to-pdf", name: "Image to PDF", category: "PDF Tools",
    description: "Combine multiple images into a single, neatly ordered PDF.",
    icon: Images, accent: "#3b82f6", keywords: ["pdf", "jpg", "png", "merge"],
    component: lazy(() => import("./pages/ImageToPDF.jsx")),
  },
  {
    id: "pdf-to-word", path: "/tools/pdf-to-word", name: "PDF to Word", category: "PDF Tools",
    description: "Turn PDF documents into editable DOCX files.",
    icon: FileText, accent: "#6366f1", keywords: ["docx", "word", "document", "pdf"],
    component: lazy(() => import("./pages/PDFToWord.jsx")),
  },
  {
    id: "youtube-downloader", path: "/tools/youtube-downloader", name: "YouTube Downloader", category: "Video Downloaders",
    description: "Download videos you are authorised to save, as MP4 or audio.",
    icon: Youtube, accent: "#ef4444", keywords: ["youtube", "video", "mp4", "mp3", "audio"],
    component: lazy(() => import("./pages/YouTubeDownloader.jsx")),
  },
  {
    id: "instagram-downloader", path: "/tools/instagram-downloader", name: "Instagram Downloader", category: "Video Downloaders",
    description: "Save public Instagram videos and Reels you have permission to download.",
    icon: Instagram, accent: "#ec4899", keywords: ["instagram", "reel", "video"],
    component: lazy(() => import("./pages/InstagramDownloader.jsx")),
  },
];

export const getTool = (id) => TOOLS.find((t) => t.id === id);

export function searchTools(query) {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;
  return TOOLS.filter((t) => [t.name, t.description, t.category, ...(t.keywords || [])].join(" ").toLowerCase().includes(q));
}
