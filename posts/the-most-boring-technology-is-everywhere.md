---
title: "The Most Boring Technology Is Everywhere"
date: "2026-08-12"
category: "minimalism"
status: "published"
---

When we say “plain text,” most people imagine a .txt file.

But .txt is only the beginning.

Look at the files sitting on a typical Linux computer:

```
notes.txt 
README.md 
config.ini 
users.csv 
package.json 
settings.json 
data.xml 
config.yaml 
access.log 
backup.sh
```

They look different because they have different purposes.

But underneath, they share something important:

**They are text.**

> You can open them with a text editor. You can inspect them without a proprietary application. You can search them, copy them, back them up, move them to another computer, and often process them with simple command-line tools.

This is one of the reasons plain-text-based computing remains so powerful.

#### 1. .TXT — The Simplest Possible Format

A .txt file makes almost no assumptions.

It is just text.

eg. **todo.txt**
```
Buy a new SSD
Read about Debian
Research backup systems
Write video script
```

There is no database behind it.

No application-specific structure.

No formatting engine.

No subscription.

You can open it with Notepad, Vim, Neovim, Nano, Kate, VS Code, or almost any other text editor.

The simplicity is the feature.

#### 2. .MD — Text With Structure

Markdown takes plain text one step further. For example, look at the below markdown document:
```
# My Linux Setup

## Applications

- Firefox
- MPV
- Neovim

## Tasks

- Configure backup
- Install fonts
- Document configuration
```
> Copy the above text in any markdown application and you will see how it looks when markdown documents are rendered.

It is still readable as ordinary text, but Markdown adds lightweight conventions for headings, lists, links, code blocks and other structure.



This makes Markdown particularly useful for:

- Documentation
- Notes
- README files
- Blogs
- Technical writing
- Knowledge bases

The important part is that the underlying document remains text.

**You don't need Microsoft Word just to write a heading.**

#### 3. .CSV — A Spreadsheet Without the Spreadsheet

CSV stands for **Comma-Separated Values**.

For example:
```
Name,Age,Country
Alice,29,India
Bob,34,Germany
Charlie,27,Japan
```

Open this in a spreadsheet application and it becomes a table.

But underneath, it is simply text containing structured values.

That means you can also manipulate it with scripts and command-line tools.

This is an important concept:

**A file doesn't need to look like a spreadsheet to contain tabular data.**

CSV is useful for:

- Data exchange
- Exporting databases
- Simple datasets
- Reports
- Import/export between applications

It also demonstrates why simple formats are powerful: the data is not fundamentally tied to Excel or any other particular application.

#### 4. .JSON — Text for Structured Data

JSON is another text-based format, commonly used to represent structured data.
```
{
  "name": "Alice",
  "age": 29,
  "country": "India"
}
```

It is particularly common in software development.

Web APIs use JSON extensively.

Configuration files use JSON.

Applications use JSON to store structured information.

And despite all of that complexity, the underlying representation remains readable text.

You can open it and inspect exactly what is inside.

That matters.

When an application stores information in a proprietary binary database, you may need that application to interpret the data.

With JSON, the structure is visible.

#### 5. .XML — Structured Text at a Larger Scale

XML is another text-based data format.
```
<person>
    <name>Alice</name>
    <age>29</age>
    <country>India</country>
</person>
```
XML became heavily used for configuration, data exchange, documents and enterprise software.

It is more verbose than JSON, but that verbosity can be useful when explicit structure and metadata are important.

Again, the interesting part is not whether XML is fashionable.

It is that the data is represented as text.

You can inspect it with a text editor.

You can search it.

You can transform it with software.

And you aren't dependent on one particular application simply to understand what the file contains.

#### 6. .INI — Configuration as Text

INI files are commonly used for configuration.

For example:

```
[server]
host=localhost
port=8080

[database]
enabled=true
```

This is particularly interesting from a Linux and digital-minimalism perspective.

A configuration doesn't necessarily need a graphical settings application.

Sometimes it can simply be:

1. open file
2. change value
3. save file

The configuration becomes visible.

You can back it up.

You can version-control it.

You can copy it to another machine.

And you can understand what the application is doing without navigating through five layers of GUI menus.


#### 7. YAML — Configuration That Reads Almost Like Notes

YAML is another human-readable text format frequently used for configuration and data serialization.

```
server:
  host: localhost
  port: 8080

database:
  enabled: true
```

It is widely encountered in modern development and infrastructure tooling.

Again, the underlying philosophy is similar:

structured information represented as text.


#### 8. Log Files — Your Computer Talking to You

Then there are log files.

```
2026-08-12 18:42:31 INFO Server started
2026-08-12 18:43:02 INFO User connected
2026-08-12 18:44:17 ERROR Connection failed
```

These are some of the most useful text files on a computer.

On Linux, you will encounter text-based logs throughout the system and applications.

And because they're text, you can do things like:

grep ERROR application.log

Or:

less application.log

Or:

tail -f application.log

This is where plain text becomes more than a storage format.

It becomes an interface between humans and programs.

#### 9. Shell Scripts — Text That Becomes a Program

A shell script is also fundamentally a text file.

```
#!/bin/bash

echo "Backing up files..."
cp important.txt /backup/
```
- You can read it.
- Edit it.
- Version-control it.
- Send it to someone.
- And then the computer can execute it.

This is one of the fundamental ideas behind Unix-like systems:

Text is an excellent common language between humans and software.

### The Bigger Idea

This is why the argument for plain text is bigger than .txt.

Consider how many things your computer does with information:


| Purpose               | Example            |
| :---------------------| ------------------:|
| Notes	                | .txt               |
| Documentation	        | .md                |
| Tables                | .csv               |
| Structured data       | .json              |
| Data exchange	        | .xml               |
| Configuration	        | .ini               |
| Configuration/data    | .yaml              |
| Logs	                | .log               |
| Automation            | .sh                |
| Source code	        | .py, .c, .js, etc. |

These formats have different syntax and different purposes.

But they share a fundamental property:

The information is represented as text.

### Why This Matters for Digital Minimalism

The point isn't that everyone should abandon graphical applications.

A spreadsheet is useful when you need calculations.

A word processor is useful when you need complex page layout.

A database is useful when you have large, relational datasets.

The point is to recognize the difference between the information and the software used to manipulate it.

If your information can live in a simple, open, text-based format, you gain several advantages:

#####  Portability

Your files can move between operating systems and applications.

##### Transparency

You can inspect what is actually inside the file.

##### Longevity

The format isn't necessarily tied to the lifespan of one particular application.

##### Automation

Programs and command-line tools can process text easily.

##### Version control

Text files work extremely well with systems such as Git because changes can be represented as differences.

##### Ownership

Your data can remain a collection of files that you control rather than an opaque database belonging to an application ecosystem.

### The Real Lesson

Use the simplest format that adequately represents the problem.

- If you need a note, maybe you need .txt.
- If you need structured notes, .md might be better.
- If you need tabular data, use .csv.
- If you need structured application data, .json or .xml may make sense.
- If you need configuration, .ini or YAML might be appropriate.

**The important thing is that you can understand what you're storing and retain control over it.**

Modern computing often encourages us to think in terms of applications first:

*“Which app should I use for my notes?”*

Plain-text computing encourages a different question:

*“What is the simplest representation of the information I actually need?”*

That is a much more interesting way to think about computers.

And perhaps that's why some of the most useful technology on your computer is also some of the most boring.

### A file containing nothing but text.

