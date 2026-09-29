# Update the existing `nt-connect` GitHub repository — cyclone release

These files update documentation only. They **do not** include or overwrite your real, already-calculated `app/cyclone_frequency_data.js`. Keep the one downloaded from **Export shareable cyclone_frequency_data.js**.

## Step 1 — Copy files

From this ZIP copy:
- `README.md` → `remote-connectivity/README.md` (replace)
- `app/README.md` → `remote-connectivity/app/README.md` (replace)
- `docs/CYCLONE_SEASONAL_METHOD.md` → `remote-connectivity/docs/CYCLONE_SEASONAL_METHOD.md` (add)

Leave the actual final application files untouched. If you have not yet copied the cyclone-updated app into the existing repository, do so first; then replace the app's **placeholder** `cyclone_frequency_data.js` with the **real exported** one from your browser Downloads folder.

## Step 2 — Check the calculated file

Open `app/cyclone_frequency_data.js`. It should contain `window.NT_CYCLONE_SEASONAL` and a non-empty `locations` object. If it only says `status:'not-calculated'` and `locations:{}`, return to the app, calculate from raw BOM CSV, and export again.

Run a fresh/incognito test at `http://localhost:8081/` and check seasonal percentages load without a new BOM import. Test an offline refresh too.

## Step 3 — Commit to the existing GitHub repo

Open Git Bash inside `remote-connectivity` (the folder containing `.git`):

```bash
git status
git remote -v
```

`origin` should be `https://github.com/Sangam-077/nt-connect.git`. If it is still the old repository, update it **before pushing**:

```bash
git remote set-url origin https://github.com/Sangam-077/nt-connect.git
```

Stage the app (including deletions from the previous app version) and documentation:

```bash
git add -A app
git add README.md docs/CYCLONE_SEASONAL_METHOD.md
git diff --cached --stat
git diff --cached --check
git status --short
```

Make sure `app/cyclone_frequency_data.js` is staged and it is the calculated version. Don't stage old backup folders, downloaded release ZIPs, passwords, or the raw BOM archive unnecessarily.

Then:

```bash
git commit -m "Add historical cyclone occurrence and update documentation"
git push origin main
```

Refresh: https://github.com/Sangam-077/nt-connect

Verify `app/cyclone_frequency_data.js`, `app/cyclone_frequency_import.js`, and the updated root `README.md` exist on GitHub. Publishing code to a repo is separate from enabling GitHub Pages.
