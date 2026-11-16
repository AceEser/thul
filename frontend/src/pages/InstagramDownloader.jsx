import ToolLayout from "../components/ToolLayout.jsx";
import MediaDownloader from "../components/MediaDownloader.jsx";

export default function InstagramDownloader() {
  return (
    <ToolLayout id="instagram-downloader">
      <MediaDownloader platform="instagram" placeholder="Paste an Instagram video or Reel link…"
        notice="Works only for publicly accessible videos and Reels that you own or have permission to download. THUL never asks for your Instagram login or cookies and cannot access private accounts. Availability depends on Instagram's current restrictions and may change at any time." />
    </ToolLayout>
  );
}
