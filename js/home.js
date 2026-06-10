/* ============================================================
   home.js — plaintextlab
   Post data, search, category filter, and pagination
   ============================================================ */

// ── Post data ──────────────────────────────────────────────
// To add a new post: push an object to this array.
// Fields: title, excerpt, date (YYYY-MM-DD), category, readtime, slug
const POSTS = [
  {
    title: "Why I Write in Plain Text",
    excerpt: "Every note-taking app promises to change your life. After years of migrations and lost data, I went back to .txt files and never looked back.",
    date: "2025-06-08",
    category: "Tools",
    readtime: "4 min",
    slug: "posts/why-i-write-in-plain-text.html"
  },
  {
    title: "Building a Static Blog on GitHub Pages",
    excerpt: "No frameworks, no build step, no npm install. Just HTML, a bit of JavaScript, and a git push. Here's the full setup I use for this site.",
    date: "2025-05-30",
    category: "Web",
    readtime: "6 min",
    slug: "posts/building-a-static-blog.html"
  },
  {
    title: "The Unix Philosophy, Revisited",
    excerpt: "Write programs that do one thing well. Write programs that work together. After 50 years, this still reads like a manifesto for modern software.",
    date: "2025-05-18",
    category: "Essays",
    readtime: "8 min",
    slug: "#"
  },
  {
    title: "My Terminal Setup in 2025",
    excerpt: "A walkthrough of my shell config, prompt, aliases, and the handful of CLI tools I actually reach for every day.",
    date: "2025-05-05",
    category: "Tools",
    readtime: "5 min",
    slug: "#"
  },
  {
    title: "Notes on Reading Technical Papers",
    excerpt: "Most papers are written for reviewers, not readers. A few tactics that help me get through them without losing the thread.",
    date: "2025-04-22",
    category: "Essays",
    readtime: "5 min",
    slug: "#"
  },
  {
    title: "grep, sed, awk: A Practical Refresher",
    excerpt: "These three tools have been on every Unix system for decades. I keep forgetting the syntax. Here's the cheat-sheet I actually use.",
    date: "2025-04-10",
    category: "Code",
    readtime: "7 min",
    slug: "#"
  },
  {
    title: "Against Complexity: A Case for Boring Tech",
    excerpt: "The best stack is often the one you already understand. A short argument for choosing boring, predictable technology over whatever is new.",
    date: "2025-03-29",
    category: "Essays",
    readtime: "6 min",
    slug: "#"
  },
  {
    title: "Writing a Tiny HTTP Server in Python",
    excerpt: "Python's stdlib http.server is underrated. In under 60 lines you can build something surprisingly capable for local dev and tooling.",
    date: "2025-03-14",
    category: "Code",
    readtime: "9 min",
    slug: "#"
  },
  {
    title: "On Taking Notes While Reading",
    excerpt: "Reading without writing is like dreaming without sleeping. Some notes on my annotation system for books and articles.",
    date: "2025-02-28",
    category: "Essays",
    readtime: "4 min",
    slug: "#"
  },
  {
    title: "rsync Is All You Need",
    excerpt: "Before reaching for a cloud sync service, consider rsync. It's fast, scriptable, and you already have it. A practical guide.",
    date: "2025-02-10",
    category: "Tools",
    readtime: "5 min",
    slug: "#"
  },
  {
    title: "A Short History of Markdown",
    excerpt: "John Gruber published Markdown in 2004 to make writing for the web feel like writing email. Twenty years later it's everywhere — and still plain text.",
    date: "2025-01-25",
    category: "Web",
    readtime: "6 min",
    slug: "#"
  },
  {
    title: "CSS That Doesn't Fight You",
    excerpt: "A few layout patterns I keep coming back to: the stack, the cluster, the repel. No frameworks required.",
    date: "2025-01-08",
    category: "Web",
    readtime: "7 min",
    slug: "#"
  },
];

const POSTS_PER_PAGE = 6;

// ── State ──────────────────────────────────────────────────
let currentPage   = 1;
let currentCat    = "all";
let currentSearch = "";

// ── Build category buttons ─────────────────────────────────
const cats   = [...new Set(POSTS.map(p => p.category))].sort();
const catRow = document.getElementById("cat-row");

cats.forEach(cat => {
  const btn = document.createElement("button");
  btn.className    = "cat-btn";
  btn.dataset.cat  = cat;
  btn.textContent  = cat;
  catRow.appendChild(btn);
});

// ── Helpers ────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function filteredPosts() {
  return POSTS.filter(p => {
    const matchCat    = currentCat === "all" || p.category === currentCat;
    const q           = currentSearch.toLowerCase().trim();
    const matchSearch = !q
      || p.title.toLowerCase().includes(q)
      || p.excerpt.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
}

// ── Render post list ───────────────────────────────────────
function render() {
  const posts  = filteredPosts();
  const total  = posts.length;
  const pages  = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  currentPage  = Math.min(currentPage, pages);
  const start  = (currentPage - 1) * POSTS_PER_PAGE;
  const slice  = posts.slice(start, start + POSTS_PER_PAGE);

  const list    = document.getElementById("post-list");
  const noRes   = document.getElementById("no-results");
  const countEl = document.getElementById("search-count");
  const label   = document.getElementById("posts-label");

  // Search result count
  countEl.textContent = currentSearch.trim()
    ? `// ${total} result${total !== 1 ? "s" : ""} for "${currentSearch.trim()}"`
    : "";

  // Section label
  label.textContent = currentCat === "all"
    ? `Posts (${total})`
    : `${currentCat} (${total})`;

  // Posts
  if (slice.length === 0) {
    list.innerHTML   = "";
    noRes.style.display = "block";
  } else {
    noRes.style.display = "none";
    list.innerHTML = slice.map((p, i) => `
      <a href="${p.slug}" class="post-item">
        <div class="post-left">
          <div class="post-title">${p.title}</div>
          <div class="post-excerpt">${p.excerpt}</div>
          <div class="post-meta">
            <span class="post-cat">${p.category}</span>
            <span class="post-date">${formatDate(p.date)}</span>
            <span class="post-readtime">${p.readtime} read</span>
          </div>
        </div>
        <div class="post-right">
          <div class="post-number">${String(start + i + 1).padStart(2, "0")}</div>
        </div>
      </a>
    `).join("");
  }

  renderPagination(pages, total, start);
}

// ── Render pagination ──────────────────────────────────────
function renderPagination(pages, total, start) {
  const el = document.getElementById("pagination");
  if (pages <= 1) { el.innerHTML = ""; return; }

  const end = Math.min(currentPage * POSTS_PER_PAGE, total);

  let pageBtns = "";
  for (let i = 1; i <= pages; i++) {
    pageBtns += `<button class="page-btn${i === currentPage ? " current" : ""}" data-page="${i}">${i}</button>`;
  }

  el.innerHTML = `
    <span class="page-info">${start + 1}–${end} of ${total}</span>
    <div class="page-controls">
      <button class="page-btn" id="prev-btn" ${currentPage === 1 ? "disabled" : ""}>← prev</button>
      ${pageBtns}
      <button class="page-btn" id="next-btn" ${currentPage === pages ? "disabled" : ""}>next →</button>
    </div>
  `;

  document.getElementById("prev-btn").addEventListener("click", () => { currentPage--; render(); window.scrollTo(0, 0); });
  document.getElementById("next-btn").addEventListener("click", () => { currentPage++; render(); window.scrollTo(0, 0); });
  el.querySelectorAll(".page-btn[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      currentPage = +btn.dataset.page;
      render();
      window.scrollTo(0, 0);
    });
  });
}

// ── Event listeners ────────────────────────────────────────
document.getElementById("search-input").addEventListener("input", e => {
  currentSearch = e.target.value;
  currentPage   = 1;
  render();
});

catRow.addEventListener("click", e => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  currentCat  = btn.dataset.cat;
  currentPage = 1;
  catRow.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  render();
});

// ── Init ───────────────────────────────────────────────────
render();
