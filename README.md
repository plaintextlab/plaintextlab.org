## This is the source code for plaintextlab.org website

[plaintextlab.org](https://plaintextlab.org) is hosted on github pages

The idea is simple, you write your posts in .md format in another private repository and commit the code and github actions will automatically update your site with the new post by converting the .md files to .html files.

You are free to use the idea, but use your origial posts.



# Post Example

## Directory Structure

plaintextlab-posts
|___images/
|   |______tux.webp
|___post-1.md
|___post-2.md    


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



[plaintextlab.org](https://plaintextlab.org) visit this page for the outcome.




