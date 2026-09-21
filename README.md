# ladrefino101.com

Personal website for **Alex Benitez** / **Alejandro Benitez, EIT** — electrical & automotive engineering projects, amateur radio (**KO6ITO**), garage builds (Nissan 720, Toyota Easy-Ryder RV), and the complete self-hosted music archive from his earlier career as Aenite.

This is a **pure static site**: HTML + CSS + vanilla JS. No build step, no CMS, no database. Editing it means editing files; deploying it means uploading files. See [ADMIN.md](ADMIN.md) for day-to-day maintenance.

## Site map

| Path | What it is |
|---|---|
| `index.html` | Main page: about (incl. the ladrefino101 origin story), engineering feature, radio/callsign section, garage projects, music archive strip, latest blog posts |
| `music.html` | **The Jukebox** — all 7 classic albums, self-hosted MP3s, full player with visualizer and per-track downloads |
| `js/music-data.js` | Album/track manifest (auto-generated; see ADMIN.md) |
| `blog/index.html` + `blog/data.js` | Blog listing with hashtag-style topic filters (`#engineering`, `#radio`, `#garage`, `#music`) and shareable deep links like `/blog/#garage` |
| `blog/*.html` | Individual posts (seeded with 3 real projects) |
| `css/style.css` | Entire design system: dark-navy base, scroll-driven blue → green → orange gradient, all components |
| `js/main.js` | Scroll gradient engine, nav, KO6ITO Morse-code animation, year stamping |
| `404.html`, `favicon.svg`, `robots.txt`, `sitemap.xml` | Standard site furniture |
| `music/<album-slug>/NN-title.mp3` | 81 self-hosted tracks (7 albums) |
| `covers/<slug>.jpg` | Album cover art |

## Requirements

- Any web host that serves static files: **GitHub Pages, Netlify, Vercel/Cloudflare Pages, a cheap VPS with Nginx, or cPanel/FTP** all work.
- Nothing else. No Node, no npm, no build step at deploy time.

## Deploying to your domain (ladrefino101.com)

1. Point `ladrefino101.com` (and optionally `www`) A/CNAME records at wherever you host:
   - Netlify/GitHub Pages/Vercel → their assigned address or zone-apex setup.
   - VPS → the server's IP; add an Nginx config with `server_name ladrefino101.com www.ladrefino101.com` and root pointing at this folder. Enable HTTPS via Let's Encrypt (`certbot --nginx`).
2. Upload/copy everything in this folder to the web root (the domain must serve `index.html` from `/`).
3. If changing domains later: update the three hardcoded places — `sitemap.xml`, `robots.txt`, and any absolute URLs you add. Everything else is relative-path based, so it's domain-agnostic.

### Example Nginx config

```nginx
server {
    listen 443 ssl http2;
    server_name ladrefino101.com www.ladrefino101.com;

    root /var/www/ladrefino101;   # contents of this folder
    index index.html;

    ssl_certificate     /etc/letsencrypt/live/ladrefino101.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ladrefino101.com/privkey.pem;

    location / { try_files $uri $uri/ =404; }

    # custom 404 (the "NO CARRIER" page)
    error_page 404 /404.html;

    # sensible caching for media
    location ~* \.(mp3|jpg|png|svg)$ { expires 30d; add_header Cache-Control "public"; }
}
```

## Design notes (the non-generic part)

- **Color**: base is deep navy (`hsl(226,45%,7%)`). As you scroll, JS interpolates the background and accent through **green → orange** (`--bg-top`, `--bg-bottom`, `--acc`), so the page literally shifts palette down the page. Tune in `css/style.css` + `js/main.js`.
- **Visual language**: schematic grid overlay, oscilloscope divider, monospace "test equipment" labels, KO6ITO Morse-code animation (`-.- --- -.... .. - ---`) — a nod to both the EE and ham-radio sides of the site.
- **Music** is deliberately its own world: record-crate album rail, jukebox player with live spectrum visualizer, bonus-track badges for songs added on Bandcamp after original releases.

## Notes & known limitations

- Music files are **128 kbps MP3s** sourced from Bandcamp's streaming endpoints (the legal, account-free path). If you have the original masters/flac files, drop them in place of the mp3s and update `js/music-data.js` — instructions in ADMIN.md.
- `Emotional Piano` (track 9 on *Humanity is a Beast* per the old site) was later removed from Bandcamp and has no file here. If you have it locally, see ADMIN.md § "Missing track: Emotional Piano".
- Blog dates/tags live in one place (`blog/data.js`) so the listing never drifts from reality.
