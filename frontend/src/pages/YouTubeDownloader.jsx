import ToolLayout from "../components/ToolLayout.jsx";
import MediaDownloader from "../components/MediaDownloader.jsx";

export default function YouTubeDownloader() {
  return (
    <ToolLayout id="youtube-downloader">
      <MediaDownloader platform="youtube" placeholder="Paste a YouTube video link…"
        notice="Only download content you own or are authorised to download. Private, restricted or live videos are not supported, and not every video can be downloaded. You are responsible for respecting YouTube's Terms of Service and copyright law." />
    </ToolLayout>
  );
}
