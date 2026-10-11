/* ============================================================
   build.js — plaintextlab
   Reads posts/*.md, writes:
     dist/posts/<slug>.html   (one page per post, styled per post.css)
     dist/posts.json          (metadata index, consumed by home.js)
   Also copies the hand-written site shell (index.html, css/, js/)
   into dist/ so dist/ is the complete deployable site.

   Run: npm run build   (or: node build.js)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

const ROOT       = __dirname;
const POSTS_DIR  = path.join(ROOT, 'posts');
const OUT_DIR    = path.join(ROOT, 'dist');
const OUT_POSTS  = path.join(OUT_DIR, 'posts');

// TODO: set this to your real deployed site URL, e.g.
// 'https://username.github.io/reponame' or a custom domain.
// Required for RSS — feed readers expect absolute links, not relative ones.
const SITE_URL = 'https://plaintextlab.org';

// ---------- helpers ----------------------------------------

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

// Strip markdown syntax down to plain text, for auto-excerpt / read time.
function toPlainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')      // code blocks
    .replace(/`[^`]*`/g, ' ')             // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')// images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[#>*_~-]/g, ' ')            // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function autoExcerpt(markdownContent, maxLen = 160) {
  // Only the text before the first heading — avoids bleeding into H2/H3 text.
  const firstSection = markdownContent.split(/\n#{1,6}\s/)[0];
  const plainText = toPlainText(firstSection);
  if (plainText.length <= maxLen) return plainText;
  const cut = plainText.slice(0, maxLen);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

function readTime(plainText) {
  const words = plainText.split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + ' min';
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Parse the `cover` frontmatter flag. Tolerates quoted/unquoted booleans, any
// casing, stray whitespace/zero-width characters and curly quotes (“false”),
// which editors love to insert. Unknown values WARN instead of failing silently.
function parseCover(value, file) {
  if (value === undefined || value === null || value === '') return true; // default: show
  const v = String(value)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
    .replace(/["'\u201C\u201D\u2018\u2019]/g, '')
    .trim()
    .toLowerCase();
  if (['false', 'no', '0', 'off', 'hide', 'hidden'].includes(v)) return false;
  if (['true', 'yes', '1', 'on', 'show'].includes(v)) return true;
  console.warn(`⚠ ${file}: unrecognized cover value ${JSON.stringify(value)} — showing the cover. Use "true" or "false".`);
  return true;
}

// Heading ids so in-page links like [text](#section-name) can scroll.
// marked v12 no longer adds ids automatically. Slugs follow GitHub's rules
// (lowercase, punctuation stripped, spaces -> hyphens, duplicates get -1, -2...),
// so a table of contents written the GitHub way just works.
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s/g, '-');
}

function isExternalUrl(href) {
  if (!/^https?:\/\//i.test(href || '')) return false;
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    const own  = new URL(SITE_URL).hostname.replace(/^www\./, '');
    return host !== own;
  } catch {
    return false;
  }
}

function renderMarkdown(md) {
  const seen = new Map(); // fresh per post, so duplicate headings are only disambiguated within one post
  const renderer = new marked.Renderer();
  // Links to other sites open in a new tab. Same-site, #anchor, relative and
  // mailto: links are left alone. The extra attributes go AFTER href so the
  // YouTube-embed matcher (which expects `<a href=...`) still works.
  const defaultLink = renderer.link.bind(renderer);
  renderer.link = (href, title, text) => {
    const html = defaultLink(href, title, text);
    if (!isExternalUrl(href) || !html.startsWith('<a ')) return html;
    return html.replace(/^<a ([^>]*)>/, '<a $1 target="_blank" rel="noopener noreferrer">');
  };

  renderer.heading = (text, level, raw) => {
    const base = slugify(raw) || 'section';
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n}`;
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };
  return marked.parse(md, { renderer });
}

// Turn a paragraph that contains ONLY a YouTube link into a responsive
// 16:9 embed. Links inside a sentence are left alone as normal links.
// Supports: watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID (+ optional t=/start=)
const YT_PARAGRAPH = /<p>\s*<a href="(https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/[^"]+)"[^>]*>[^<]*<\/a>\s*<\/p>/g;

function youtubeEmbeds(html) {
  return html.replace(YT_PARAGRAPH, (match, rawUrl) => {
    let url;
    try {
      url = new URL(rawUrl.replace(/&amp;/g, '&'));
    } catch {
      return match;
    }

    let id = null;
    if (url.hostname.endsWith('youtu.be')) {
      id = url.pathname.slice(1);
    } else if (url.pathname === '/watch') {
      id = url.searchParams.get('v');
    } else {
      const m = url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/);
      id = m ? m[1] : null;
    }
    if (!id || !/^[\w-]{11}$/.test(id)) return match; // playlists, channels etc. stay as links

    const start = parseInt(url.searchParams.get('t') || url.searchParams.get('start') || '0', 10);
    const qs = start > 0 ? `?start=${start}` : '';

    // youtube-nocookie = no tracking cookies until the viewer presses play.
    // Styles are inline so this works without touching post.css.
    return `<div class="video-embed" style="position:relative;aspect-ratio:16/9;margin:24px 0;">
  <iframe src="https://www.youtube-nocookie.com/embed/${id}${qs}"
    title="YouTube video player" loading="lazy"
    style="position:absolute;inset:0;width:100%;height:100%;border:0;"
    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>`;
  });
}

// ---------- post page template ------------------------------

function postTemplate({ title, categories, dateIso, readtime, tags, contentHtml, prev, next, slug, image, showCover, coverRaw }) {
  const tagsHtml = (tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join('\n        ');

  const navHtml = `
    <div class="post-nav">
      ${prev ? `<a href="${prev.slug}.html" class="post-nav-link prev">
        <div class="nav-label">← prev</div>
        <div class="nav-title">${prev.title}</div>
      </a>` : '<div></div>'}
      ${next ? `<a href="${next.slug}.html" class="post-nav-link next">
        <div class="nav-label">next →</div>
        <div class="nav-title">${next.title}</div>
      </a>` : '<div></div>'}
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — plaintextlab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32.png" />
  <link rel="apple-touch-icon" href="../images/favicon-180.png" />
  <link rel="canonical" href="${SITE_URL}/posts/${slug}.html" />
  <link rel="stylesheet" href="../css/common.css" />
  <link rel="stylesheet" href="../css/post.css" />
</head>
<body>
  <div class="site-wrap">

    <header class="post-header-bar">
      <a href="../index.html" class="site-title">
        <img src="../images/logo-icon.png" alt="plaintextlab logo" class="site-logo" />
        <span class="prompt">~/</span>plaintextlab<span class="cursor"></span>
      </a>
      <nav>
        <a href="../index.html">← back</a>
      </nav>
    </header>

    <div class="breadcrumb">
      <a href="../index.html">home</a> / <span>${categories.join(', ')}</span>
    </div>

    <article>
      <div class="post-header">
      <div class="post-cat-tags">
        ${categories.map(c => `<span class="post-cat-tag">${c}</span>`).join('\n        ')}
      </div>
        <h1 class="post-title">${title}</h1>
        <div class="post-meta">
          <span>${formatDate(dateIso)}</span>
          <span class="sep">·</span>
          <span>${readtime} read</span>
        </div>
      </div>

      <!-- build: cover ${showCover ? 'shown' : 'hidden'} (frontmatter cover=${String(JSON.stringify(coverRaw)).replace(/--/g, '-')}) -->
      ${image && showCover ? `<img src="${image}" alt="${title}" class="post-hero-image" />` : ''}

      ${contentHtml}

      <div class="post-footer">
        ${tagsHtml ? `<div class="tags">\n        ${tagsHtml}\n      </div>` : ''}
        ${navHtml}
      </div>
    </article>

    <p class="copyright">© 2026 plaintextlab. All content is original — please don't republish without permission.</p>

  </div>

  <button type="button" id="to-top" class="to-top" aria-label="Back to top" title="Back to top">↑</button>
  <script src="../js/post.js"></script>
</body>
</html>`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildRssFeed(indexEntries) {
  const items = indexEntries.map(p => {
    const url = `${SITE_URL}/${p.slug}`;
    const pubDate = new Date(p.date + 'T00:00:00Z').toUTCString();
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>plaintextlab</title>
    <link>${SITE_URL}</link>
    <description>writing about code, tools, and the things in between</description>
${items}
  </channel>
</rss>
`;
}

// ---------- build --------------------------------------------

function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_POSTS, { recursive: true });

  // 1. Copy hand-written site shell into dist/, substituting {{SITE_URL}}
  //    tokens (used in canonical link tags) with the real configured URL.
  fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'))
    .forEach(f => {
      const content = fs.readFileSync(path.join(ROOT, f), 'utf-8')
        .replace(/\{\{SITE_URL\}\}/g, SITE_URL);
      fs.writeFileSync(path.join(OUT_DIR, f), content);
    });
  fs.copyFileSync(path.join(ROOT, 'robots.txt'), path.join(OUT_DIR, 'robots.txt'));
  copyDir(path.join(ROOT, 'css'), path.join(OUT_DIR, 'css'));
  copyDir(path.join(ROOT, 'js'), path.join(OUT_DIR, 'js'));
  copyDir(path.join(ROOT, 'images'), path.join(OUT_DIR, 'images')); // logo, favicons

  // 1b. Copy post images (posts/images/ -> dist/posts/images/) so relative
  //     paths written in markdown, e.g. ![alt](images/foo.jpg), resolve
  //     correctly against the post page's actual output location.
  copyDir(path.join(POSTS_DIR, 'images'), path.join(OUT_POSTS, 'images'));

  // 2. Parse all posts
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('No posts/ directory found.');
    process.exit(1);
  }

  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const parsed = files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const plain = toPlainText(content);

    if (!data.title || !data.date) {
      console.warn(`⚠ ${file}: missing required frontmatter (title, date) — skipping`);
      return null;
    }

    return {
      slug: slugFromFilename(file),
      title: data.title,
      date: String(data.date),
      categories: (data.category || 'General').split(',').map(c => c.trim()).filter(Boolean),
      excerpt: data.excerpt || autoExcerpt(content),
      image: data.image || null,
      // cover: "false" hides the hero image on the post page only.
      // Homepage thumbnail is unaffected. Defaults to shown. Accepts "false" or false.
      showCover: parseCover(data.cover, file),
      coverRaw: data.cover,
      readtime: readTime(plain),
      tags: data.tags || [],
      status: (data.status || 'published').trim().toLowerCase(),
      contentHtml: youtubeEmbeds(renderMarkdown(content)),
    };
  }).filter(Boolean);

  // Drafts never reach dist/, posts.json, or rss.xml — filtered out here,
  // before sorting, prev/next linking, or page generation happen.
  const draftCount = parsed.filter(p => p.status !== 'published').length;
  const posts = parsed.filter(p => p.status === 'published');
  if (draftCount > 0) {
    console.log(`Skipped ${draftCount} draft post(s) — set status: "published" to publish.`);
  }

  // Newest first
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  // 3. Write each post page, with prev/next relative to the sorted (newest-first) list
  posts.forEach((post, i) => {
    const next = posts[i - 1] || null; // newer post
    const prev = posts[i + 1] || null; // older post
    const html = postTemplate({ ...post, dateIso: post.date, prev, next });
    fs.writeFileSync(path.join(OUT_POSTS, `${post.slug}.html`), html);
    console.log(`built posts/${post.slug}.html${post.image ? `  [cover ${post.showCover ? 'SHOWN' : 'hidden'}, frontmatter cover=${JSON.stringify(post.coverRaw)}]` : ''}`);
  });

  // 4. Write posts.json — the index home.js fetches
  const index = posts.map(p => ({
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    categories: p.categories,
    readtime: p.readtime,
    slug: `posts/${p.slug}.html`,
    image: p.image ? `posts/${p.image}` : null,
  }));
  fs.writeFileSync(path.join(OUT_DIR, 'posts.json'), JSON.stringify(index, null, 2));
  console.log(`wrote posts.json (${index.length} posts)`);

  // 4b. Write rss.xml from the same index data
  fs.writeFileSync(path.join(OUT_DIR, 'rss.xml'), buildRssFeed(index));
  console.log('wrote rss.xml');

  // 5. .nojekyll so GitHub Pages doesn't mangle dist/
  fs.writeFileSync(path.join(OUT_DIR, '.nojekyll'), '');
}

build();
