# plaintextlab.org

This is the source code for the [plaintextlab.org](https://plaintextlab.org) website — a static blog built with plain HTML/CSS/JS, markdown, and GitHub Actions. No frameworks, no client-side build step for the reader, no database.

Hosted on GitHub Pages.

## How it works

Posts live in a **separate private repository**, not in this one. The idea:

1. Write a post in `.md` format in your private posts repo.
2. Commit and push.
3. GitHub Actions in the private repo automatically triggers a build in this (public) repo.
4. This repo's build pipeline (`build.js`) pulls in your markdown, converts it to HTML, and deploys the finished site to GitHub Pages.

Your original markdown source never has to live in a public repository — only the rendered HTML output does.

You're free to reuse this setup for your own site. Please don't republish the posts themselves — write your own.

## Post format

Each post is a single `.md` file with YAML frontmatter at the top.

```yaml
---
title: "Post Title"
date: "2026-08-12"
category: "minimalism"
status: "draft"
image: "images/tux.webp"
---
This is my first post written in **Markdown**.

![Screenshot of the build output](images/first-post-screenshot.png)

## Why I'm doing this

Writing in Markdown means my git diffs stay readable, and the build
pipeline turns this into a proper HTML page automatically.

- No hand-written HTML tags
- No local Node install needed
- Just write, commit, push

Here's a [link](https://example.com) and some `inline code`.
```

### Frontmatter reference

| Field      | Required | Default       | Notes                                                                 |
| ---------- | -------- | ------------- | ---------------------------------------------------------------------- |
| `title`    | Yes      | —             | Post title. Also used as the page `<title>` and Open Graph-style tags. |
| `date`     | Yes      | —             | `YYYY-MM-DD`, quoted as a string.                                      |
| `category` | No       | `"General"`   | Comma-separated for multiple: `"linux,minimalism"`. Each becomes its own filterable tag on the homepage. |
| `status`   | No       | `"published"` | `"draft"` excludes the post entirely from the build — no HTML page, not in the post list, not in RSS. |
| `image`    | No       | none          | Path relative to `images/` in the posts repo. Used as the homepage thumbnail and the post's hero image. |
| `tags`     | No       | none          | YAML list, e.g. `["linux", "tools"]`. Rendered as tags at the bottom of the post, separate from `category`. |
| `excerpt`  | No       | auto-generated | Overrides the auto-generated preview text (which is pulled from the text before the first heading). |

### Directory structure (private posts repo)

```
plaintextlab-posts/
├── images/
│   └── tux.webp
├── post-1.md
└── post-2.md
```

Image paths in frontmatter and in-post markdown (`![alt](images/foo.png)`) are relative to this `images/` folder.

## Live site

[plaintextlab.org](https://plaintextlab.org)
