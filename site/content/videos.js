/* ==========================================================================
   VIDEOS — the sketch campaign grid on the homepage.
   --------------------------------------------------------------------------
   - Newest first (the page sorts by `date`, so order here doesn't matter).
   - `src`: an HLS/MP4 URL from Mux or Cloudflare Stream. Leave null to show
     a placeholder card. Don't use TikTok embeds: slow and ugly.
       Mux:        https://stream.mux.com/{PLAYBACK_ID}.m3u8   (needs hls.js on Chrome)
                   https://stream.mux.com/{PLAYBACK_ID}/medium.mp4 (simple MP4)
       Cloudflare: https://customer-XXXX.cloudflarestream.com/{UID}/manifest/video.m3u8
   - `poster`: thumbnail. Mux: https://image.mux.com/{PLAYBACK_ID}/thumbnail.jpg
   - `tiktok` / `instagram`: the original post, so views count there too.
   - `id` becomes the share link: index.html#video-{id}
   ========================================================================== */
window.ABG_VIDEOS = [
  { id: 'hope-this-finds-you', title: 'Every AI email starts the same way', date: '2026-09-26', src: null, poster: null, tiktok: 'https://www.tiktok.com/@aibutgreat', instagram: 'https://www.instagram.com/aibutgreat' },
  { id: 'teacher-reads-essay', title: 'Teacher reads an essay out loud and can\'t tell', date: '2026-09-22', src: null, poster: null, tiktok: 'https://www.tiktok.com/@aibutgreat', instagram: 'https://www.instagram.com/aibutgreat' },
  { id: 'breakup-text-reaction', title: 'He got dumped by text and said "honestly, fair"', date: '2026-09-18', src: null, poster: null, tiktok: 'https://www.tiktok.com/@aibutgreat', instagram: null },
  { id: 'em-dash-intervention', title: 'An intervention for my em dash problem', date: '2026-09-14', src: null, poster: null, tiktok: 'https://www.tiktok.com/@aibutgreat', instagram: 'https://www.instagram.com/aibutgreat' },
  { id: 'landlord-called-back', title: 'The landlord called back in 11 minutes', date: '2026-09-10', src: null, poster: null, tiktok: 'https://www.tiktok.com/@aibutgreat', instagram: null },
  { id: 'best-man-speech', title: 'Best man speech, written in 7 seconds', date: '2026-09-05', src: null, poster: null, tiktok: 'https://www.tiktok.com/@aibutgreat', instagram: 'https://www.instagram.com/aibutgreat' },
];
