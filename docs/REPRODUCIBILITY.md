# Reproducing the NT Connect analysis

## What is runnable without Python?

The final dashboard is self-contained in `app/`. It bundles the source-derived JSON and map assets used to display the core experience. The `data/` and `notebook/` directories are retained to explain and reproduce the analysis; they are not required to **view** the static app.

Run the app from a local server:

```bash
cd app
python -m http.server 8070
# Windows alternative: py -m http.server 8070
```

Visit <http://localhost:8070/>. Browsing via `file://` does not test the service worker correctly.

## Optional notebook environment

From the repository root:

```bash
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# Windows Git Bash: source .venv/Scripts/activate
pip install -r requirements-analysis.txt
jupyter lab
```

Run the mobile coverage, integrated NT data pipeline and cyclone analysis notebooks **in their documented cell order**. The notebook folder is named `notebook/` in this repository. Some historical notebooks may contain a user-specific Windows `PROJECT_ROOT`; change that to your local checkout before running. Do not assume all notebooks can rerun without obtaining their original source inputs.

The data sources used by the project are described in [DATA_AND_ETHICS.md](DATA_AND_ETHICS.md). Large downloaded GIS distribution files (for example NBN footprints and ABS GeoPackages) and `*.zip` files are ignored by `.gitignore`; download them from their publishers if full reprocessing is required. Do not fabricate missing inputs or replace unavailable fields with zeros. The current app already contains the cleaned, displayed outputs.

## Processing outline

1. Read the NT Remote Areas Mobile Coverage workbook and standardise indicator flags, site names and coordinates. Retain absent population as unknown.
2. Join NT points to ABS remoteness geography, the **fixed-line-only** NBN footprint and nearest listed Mobile Black Spot projects.
3. Build historical cyclone tracks from the BOM observation sequence, derive track proximity and compute the relative exposure-context score.
4. Match the conservative published service directory at locality level. A nonmatch does not mean no service exists.
5. Use app-contained JSON to power exploration. The app's adjustable Gap Index is exploratory and implemented in `app/app.js`.

## Data integrity

- Mobile infrastructure indicators are not live coverage measurements.
- A fixed-line polygon does not describe every broadband technology.
- Historical cyclone-track proximity is not a future hazard probability.
- Directory-listed services do not establish live opening hours or precise facility coordinates.
- Static offline packs are not live emergency alerts or a calling facility.

For exact formulas and limitations see [METHODOLOGY.md](METHODOLOGY.md).
