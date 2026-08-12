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

// ---------- post page template ------------------------------

function postTemplate({ title, category, dateIso, readtime, tags, contentHtml, prev, next }) {
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
      <a href="../index.html">home</a> / <span>${category}</span>
    </div>

    <article>
      <div class="post-header">
        <span class="post-cat-tag">${category}</span>
        <h1 class="post-title">${title}</h1>
        <div class="post-meta">
          <span>${formatDate(dateIso)}</span>
          <span class="sep">·</span>
          <span>${readtime} read</span>
        </div>
      </div>

      ${contentHtml}

      <div class="post-footer">
        ${tagsHtml ? `<div class="tags">\n        ${tagsHtml}\n      </div>` : ''}
        ${navHtml}
      </div>
    </article>

  </div>
</body>
</html>`;
}

// ---------- build --------------------------------------------

function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_POSTS, { recursive: true });

  // 1. Copy hand-written site shell into dist/
  fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(OUT_DIR, 'index.html'));
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
  const posts = files.map(file => {
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
      category: data.category || 'General',
      excerpt: data.excerpt || autoExcerpt(content),
      readtime: readTime(plain),
      tags: data.tags || [],
      contentHtml: marked.parse(content),
    };
  }).filter(Boolean);

  // Newest first
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  // 3. Write each post page, with prev/next relative to the sorted (newest-first) list
  posts.forEach((post, i) => {
    const next = posts[i - 1] || null; // newer post
    const prev = posts[i + 1] || null; // older post
    const html = postTemplate({ ...post, dateIso: post.date, prev, next });
    fs.writeFileSync(path.join(OUT_POSTS, `${post.slug}.html`), html);
    console.log(`built posts/${post.slug}.html`);
  });

  // 4. Write posts.json — the index home.js fetches
  const index = posts.map(p => ({
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    category: p.category,
    readtime: p.readtime,
    slug: `posts/${p.slug}.html`,
  }));
  fs.writeFileSync(path.join(OUT_DIR, 'posts.json'), JSON.stringify(index, null, 2));
  console.log(`wrote posts.json (${index.length} posts)`);

  // 5. .nojekyll so GitHub Pages doesn't mangle dist/
  fs.writeFileSync(path.join(OUT_DIR, '.nojekyll'), '');
}

build();
