/* ============================================================
   home.js — plaintextlab
   Post data comes from posts.json, generated at build time by
   build.js from the markdown files in posts/. To add, edit, or
   remove a post: touch the .md files in posts/ only — never
   edit post data in this file.
   ============================================================ */

// ── Post data ──────────────────────────────────────────────
let POSTS = [];

const POSTS_PER_PAGE = 6;

// ── State ──────────────────────────────────────────────────
let currentPage   = 1;
let currentCat    = "all";
let currentSearch = "";

const catRow = document.getElementById("cat-row");

// ── Build category buttons ─────────────────────────────────
function buildCategoryButtons() {
  const cats = [...new Set(POSTS.map(p => p.category))].sort();
  cats.forEach(cat => {
    const btn = document.createElement("button");
    btn.className    = "cat-btn";
    btn.dataset.cat  = cat;
    btn.textContent  = cat;
    catRow.appendChild(btn);
  });
}

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
fetch("posts.json")
  .then(res => {
    if (!res.ok) throw new Error("posts.json not found — did the build run?");
    return res.json();
  })
  .then(data => {
    POSTS = data;
    buildCategoryButtons();
    render();
  })
  .catch(err => {
    document.getElementById("post-list").innerHTML =
      `<p style="font-family: var(--mono); font-size: 12px; color: var(--muted);">${err.message}</p>`;
    console.error(err);
  });
