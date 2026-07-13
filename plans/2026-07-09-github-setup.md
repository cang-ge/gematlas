# GitHub Repository — Setup Commands

These commands set up the `gematlas` GitHub repository. Run them after reviewing.

---

## 1. Create the GitHub repository

```bash
# Create the repo on GitHub with description + homepage
gh repo create gematlas \
  --public \
  --description "A bilingual open-source gemological knowledge platform — 10 cornerstone gems across classification, identification, cutting, grading, and maison gallery." \
  --homepage "https://cang-ge.github.io/gematlas/" \
  --source=. \
  --remote=origin \
  --push
```

Flags explained:
- `--public` — repo is open-source (matches MIT license)
- `--description` — short tagline for the GitHub repo card
- `--homepage` — link to the deployed GitHub Pages site (configured in P9)
- `--source=.` — initialize from current directory (must contain `.git/`)
- `--remote=origin` — set up `origin` remote
- `--push` — push all branches immediately

If the repo already exists on GitHub (created via web), omit `--source` and `--push`:
```bash
gh repo create gematlas --public \
  --description "..." --homepage "..."  # creates an empty repo
git remote add origin git@github.com:cang-ge/gematlas.git  # if not set
git push -u origin master
```

---

## 2. Configure repo settings (after creation)

```bash
# Add topics (keywords) — improves search discoverability
gh repo edit gematlas \
  --add-topic "gemology" \
  --add-topic "gemstones" \
  --add-topic "bilingual" \
  --add-topic "vitepress" \
  --add-topic "education" \
  --add-topic "open-source" \
  --add-topic "knowledge-base"

# Enable Issues + Discussions (default for public repos)
gh repo edit gematlas --enable-issues --enable-discussions

# Disable Wiki (we use docs/ as the canonical reference)
gh repo edit gematlas --disable-wiki
```

---

## 3. Set up GitHub Pages

The CI workflow in `.github/workflows/ci.yml` already handles deployment.
After the first push to `master`, configure Pages:

```bash
# Settings → Pages → Source = "Deploy from a branch" → Branch = gh-pages / root
# Or via API:
gh api repos/cang-ge/gematlas/pages -X POST \
  -f source.branch=gh-pages \
  -f source.path="/"
```

After ~1 minute the site will be live at `https://cang-ge.github.io/gematlas/`.

---

## 4. Update README placeholders

After the repo is live, fix the `<owner>` placeholder in README files:

```bash
# Find and replace
sed -i 's|<owner>|cang-ge|g' README.md README.en.md README.zh.md
git commit -am "docs: replace <owner> placeholder with cang-ge"
git push
```

---

## 5. Pin the repo (optional)

To feature GemAtlas on your GitHub profile:

```bash
gh repo pin cang-ge/gematlas
```

---

## Short description (≤ 350 chars, for GitHub repo card)

```
A bilingual open-source gemological knowledge platform — 10 cornerstone gems
across classification, identification, cutting, grading, and maison gallery.
Built with VitePress + Vue 3. Data-driven (YAML), strict en/zh sync, MIT licensed.
```

## Topics

```
gemology, gemstones, bilingual, vitepress, education, open-source,
knowledge-base, typescript
```

---

## Verification

After setup, run:

```bash
gh repo view cang-ge/gematlas --web  # open in browser
gh api repos/cang-ge/gematlas       # verify description + topics
```

Site live check: https://cang-ge.github.io/gematlas/