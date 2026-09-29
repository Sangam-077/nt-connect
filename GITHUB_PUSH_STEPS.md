# Publish NT Connect to a NEW GitHub repository

1. At https://github.com/new, choose repository name **nt-connect**, visibility Private until ready for judges, and **do not initialise README, .gitignore or license**.
2. Copy `README.md`, `.gitignore`, `.nojekyll`, `.gitattributes`, `requirements-analysis.txt` and `docs/` from this ZIP into your existing project root alongside `app/`, `data/`, `notebook/`, `outputs/`. Do not replace the app.
3. Open Git Bash **in your project root**, then run:

```bash
git status
git remote -v
```

- If Git says **not a git repository**:

```bash
git init -b main
```

- If this folder already is a Git repository, inspect the existing remote. Switching its URL preserves prior commit history; use a fresh checkout/folder to start new history. To publish to the NEW `nt-connect` repo instead, switch its remote by:

```bash
git remote set-url origin https://github.com/Sangam-077/nt-connect.git
```

- If there is **no origin** yet, add it:

```bash
git remote add origin https://github.com/Sangam-077/nt-connect.git
```

4. Stage and inspect:

```bash
git add -A
git status --short
git diff --cached --stat
git diff --cached --check
```

Do not commit personal information, API credentials, temporary prototypes, huge unwanted raw files, or hidden OneDrive artifacts. The bundled app itself is self-contained for ordinary use; raw source ZIPs may be omitted by the .gitignore and source links can be documented separately.

5. For a new initial commit, or if the working branch is already `main`:

```bash
git branch -M main
git commit -m "Initial release: NT Connect offline-first resilience planner"
git push -u origin main
```

If this is an existing repository with a shared history, use its actual working branch and verify the destination before pushing. Never force-push.

6. Open the repository in GitHub and verify `app/`, `data/`, `notebook/`, `outputs/`, `docs/`, `README.md` all appear as intended. Empty directories are not tracked by Git, and files ignored via .gitignore will not appear.

7. To run the site on the local machine, open a terminal in `app/` and run `python -m http.server 8070` (or Windows `py -m http.server 8070`), then open `http://localhost:8070/`.
