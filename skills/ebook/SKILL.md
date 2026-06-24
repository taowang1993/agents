---
name: ebook
description: Convert ebooks into Markdown folders. Use whenever the user wants EPUB, MOBI, AZW, or AZW3 books converted to split Markdown files, wants ebook chapters extracted as .md files, wants ebook images extracted, or asks to inspect EPUB structure. Prefer epub2md for EPUB; use Calibre ebook-convert only as a MOBI/AZW to EPUB bridge.
---

# Ebook

Convert ebook files into a folder of Markdown chapters with images.

## Default workflow

Use the bundled script: [`scripts/ebook-to-md.sh`](scripts/ebook-to-md.sh).

```bash
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh book.epub
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh book.mobi
```

By default, write the output next to the input as a folder named after the book file without its extension.

## Tool choice

- For `.epub`, use `epub2md`; it produces clean numbered Markdown files and an `images/` folder.
- For `.mobi`, `.azw`, or `.azw3`, use Calibre `ebook-convert` to make a temporary EPUB, then run `epub2md`.

## Commands

Convert one ebook:

```bash
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh "/path/to/book.epub"
```

Choose an output folder:

```bash
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh "/path/to/book.mobi" --out "/path/to/book-markdown"
```

Overwrite an existing output folder:

```bash
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh "/path/to/book.epub" --force
```

Pass epub2md options after `--`:

```bash
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh book.epub -- --autocorrect
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh book.epub -- --merge
/Users/max/.agents/skills/ebook/scripts/ebook-to-md.sh book.epub -- --localize
```

Inspect an EPUB without converting:

```bash
npx -y epub2md@latest --info book.epub
npx -y epub2md@latest --structure book.epub
npx -y epub2md@latest --sections book.epub
```

## Dependencies

Check tools before converting:

```bash
command -v node
command -v npx
command -v ebook-convert  # required only for MOBI/AZW/AZW3
```

Install Calibre for MOBI/AZW/AZW3 support:

```bash
brew install --cask calibre
```

The script uses a globally installed `epub2md` if present; otherwise it runs `npx -y epub2md@latest`.
