# ADMIN.md — maintaining ladrefino101.com

Everything you'll ever need to change about this site, in one place. The site is 100% static: **edit a file → upload the file**. That's the whole admin workflow.

## Where things live (quick map)

| Want to change… | Edit… |
|---|---|
| Main page text / sections | `index.html` |
| Colors, fonts, layout | `css/style.css` (CSS variables at top of file are the main dials: `--bg-top`, `--accent-green`, `--accent-orange`) |
| Scroll gradient behavior | `js/main.js` → `SCROLL_STOPS` array + `applyGradient()` |
| Album list / tracklist in the jukebox | `js/music-data.js` |
| Music files themselves | `music/<album>/NN-title.mp3`, covers in `covers/` |
| Blog post listing, dates, tags | `blog/data.js` (one entry per post) |
| A blog post's content | the matching file in `blog/*.html` |
| Contact email / footer | bottom of `index.html` (`<!-- EDIT ME -->` markers point at these) |
| Search engine listing | `sitemap.xml`, `robots.txt` |

All seeded copy contains HTML comments like `<!-- EDIT ME: ... -->` — grep for them to find every placeholder:

```bash
grep -rn "EDIT ME" --include="*.html" .
```

---

## Adding a blog post (the most common task)

1. **Copy an existing post** as your template, e.g.:
   ```bash
   cp blog/nissan720-carb-to-fi.html blog/my-new-post.html
   ```
2. **Edit the copy** in `blog/my-new-post.html`:
   - `<title>` and meta description in `<head>`
   - `<span class="post-date">…</span>` — display date (Month D, YYYY)
   - heading + `.post-tags` chips (each tag links to `index.html#tag`)
   - body content under `<article class="prose">`
3. **Register it** in `blog/data.js` so it shows on the listing and homepage:
   ```js
   {
     file: 'my-new-post.html',
     title: 'My New Post Title',
     date: '2026-08-01',          // YYYY-MM-DD — controls sort order
     tags: ['engineering'],        // any of: engineering, radio, garage, music (or invent a new one)
     excerpt: 'One or two sentences for the card.'
   }
   ```
4. **Add it to `sitemap.xml`** so search engines find it.

That's it — no build step. The tag filter chips on `/blog/` regenerate automatically from whatever tags exist in `data.js`.

### Tag deep links
Tags are literal URL fragments: `https://ladrefino101.com/blog/#garage`, `...#engineering`, etc. Share those freely; they work as permanent filters.

---

## Music maintenance

The jukebox is driven by **`js/music-data.js`** — one object per album with `slug`, `title`, `year`, `art`, `bandcamp` URL, and a `tracks[]` array of `{ file, title, dur, bonus? }`. Track numbers in filenames (`01-…`, `02-…`) are just for your sanity; playback order is the **order in the array**.

### Replacing 128 kbps files with higher-quality masters
The MP3s currently on this site were pulled from Bandcamp's public streaming endpoints (mp3-128). If you have FLAC/masters:
1. Put the new file at the same path, e.g. overwrite `music/eigengrau/01-eigengrau.mp3` with your better-encoded mp3 (or rename it and update one line in `js/music-data.js`).
2. Update that track's `dur:` if length changed noticeably.
No other changes needed — the player, downloads, and visualizer all pick up whatever file is at that path.

### Missing track: "Emotional Piano"
The old site listed 9 tracks on *Humanity is a Beast*; Bandcamp later removed **Emotional Piano** (track 9). If you have a local copy of it:
1. Save it as `music/humanity-is-a-beast/09-emotional-piano.mp3`
2. In `js/music-data.js`, add to that album's `tracks[]` after `Desolate`:
   ```js
   { file: 'music/humanity-is-a-beast/09-emotional-piano.mp3', title: 'Emotional Piano', dur: 180 },
   ```

### Adding a brand-new album later
1. Create folder `music/<new-slug>/` with numbered mp3s, cover in `covers/<new-slug>.jpg`.
2. Add an entry to `js/music-data.js`:
   ```js
   { slug: 'my-new-album', title: 'My New Album', year: 2027,
     art: 'covers/my-new-album.jpg', bandcamp: 'https://aenite.bandcamp.com/album/my-new-album',
     tracks: [ { file: 'music/my-new-album/01-first.mp3', title: 'First', dur: 123 }, … ] }
   ```
   (Order in the array = playback order; albums on the rail sort by their position here.)
3. Add its cover card to the music strip in `index.html` if you want it featured there, and update `sitemap.xml` only if it's a page (it isn't — skip).

### Re-pulling track data from Bandcamp (only needed rarely)
The research tooling used at build time (`_research/fetch_bc.mjs`, `download.mjs`) lives **outside** this folder on purpose and should never be deployed. If you ever need to refresh metadata, run those scripts in the project directory and re-run `gen_music_data.mjs`.

---

## Keeping it online (low-maintenance checklist)

- [ ] After any change: upload changed files to the web root (FTP/rsync/git push depending on host).
- [ ] Once a year or so: check that external links still work — especially the Sunnypilot thread and QRZ lookups.
- [ ] If you post music again: follow "Adding a brand-new album" above; the Bandcamp support link per album is generated from each entry's `bandcamp` field.
- [ ] Before big holidays/deadlines, nothing to do. It's static. That was the point.

## Security / privacy notes

- No cookies, no analytics, no tracking of any kind — just your files on a server.
- The email address in the footer is public; consider using a dedicated address if you don't want your personal inbox exposed (edit bottom of `index.html`).
- The music MP3s are copyrighted by you and hosted by you — nothing else to worry about, but keep backups off-site regardless (`_research/` notes show where they came from).
