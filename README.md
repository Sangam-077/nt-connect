# NT Connect

**Find gaps. Plan action. Stay usable offline.**

An offline-first Northern Territory connectivity and community-resilience explorer developed for the **Charles Darwin University Data Innovation Challenge — Remote Connectivity**.

NT Connect integrates source-derived mobile-infrastructure indicators, NT Mobile Black Spot projects, ABS remoteness, population (where recorded), the supplied 2024 **NBN fixed-line-only** footprint, historical BOM cyclone-track context, optional calculated historical cyclone-season occurrence, and a limited, published locality-level essential-services directory. It turns fragmented information into an understandable map, an **exploratory** Gap Index, possible action plans, and readable offline community packs.

## What can you do?

- Explore **188** NT source locations and **48** Mobile Black Spot programme project records using an offline-friendly map.
- Search, filter and compare locations; switch map views between gap index, cyclone context and infrastructure classification.
- Inspect the contributing evidence and the transparent, adjustable Gap Index, including a completeness indicator (not a scientific confidence interval).
- View preliminary infrastructure and service-resilience investigations, directory-listed health/school/shelter information where verified, and an emergency *reference* panel.
- Download self-contained HTML community planning reports; after a successful first visit, use the locally cached core web app without an internet connection.
- Display a separate **historical cyclone-season occurrence** indicator (50/100/200 km radii) calculated from the official BOM best-track CSV, and bundle the derived results so visitors need not import the original raw archive.

![Offline-first](https://img.shields.io/badge/Approach-Offline--first-1e998a) ![Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript-17466a)

## Run locally

From the repository root:

```bash
cd app
python -m http.server 8081
# Windows alternative: py -m http.server 8081
```

Open **http://localhost:8081/** in Chrome or Edge. Serve via HTTP: opening `index.html` as `file://` will not correctly exercise the service worker.

### Verify offline operation

1. Open the site once online, allow the core resources to cache and refresh if necessary to gain a service-worker controller.
2. In Chrome or Edge: **F12 → Network → Offline → Refresh**. The core map, bundled records, search and profiles should still load.
3. Download a community HTML pack and open the file without network access. It remains readable independently of the app.
4. Emergency reference information is not live guidance, and calling any listed number still requires a working telephone network.

## New: historical cyclone-season occurrence (BOM, separate from Gap Index)

The **Historical frequency** map mode and selected-community profile display how often a BOM tropical-cyclone-system **centre track passed within 100 km** in the **45 complete Australian cyclone seasons, 1980–81 through 2024–25**. The panel can also show 50 km and 200 km results. A season with more than one nearby cyclone is counted once.

**Calculation:** `Historical occurrence (%) = seasons with ≥1 nearby track ÷ 45 × 100`. For example, 13 out of 45 seasons = **28.9% historical occurrence**. This is past frequency **not** a 28.9% forecast probability for the next season, a direct-hit count, or an estimate of local wind, flooding, damage, service loss or safety.

### Bundle the actual results for GitHub viewers

The raw BOM file is not required in the deployed app. The analysis runs locally in the browser:

1. Select a community → **Historical cyclone-season occurrence** → **Import BOM CSV & calculate**.
2. Import your original `bom_tropical_cyclone_tracks.csv` / `IDCKMSTM0S.csv` and choose **Calculate all locations**.
3. Click **Export shareable cyclone_frequency_data.js**. Copy the downloaded file into `app/`, **replacing the placeholder** `app/cyclone_frequency_data.js`.
4. Confirm the new file contains `window.NT_CYCLONE_SEASONAL` and location results, rather than `status:'not-calculated'` with `locations:{}`.
5. Open the site in a fresh/incognito browser: historical percentages should show **without** re-importing the raw CSV. Verify an offline refresh too.

**Important:** The historical occurrence percentage is displayed *separately*. It **does not replace** the existing relative `cyclone_exposure_context_score` or change the default six-factor Gap Index. The calculation uses BOM cyclone-system tracks, 45 July–June seasons, local approximate distance calculations and interpolation between fixes no more than 24 hours apart. See [seasonal cyclone method](docs/CYCLONE_SEASONAL_METHOD.md).

## Typical demonstration

**Find → Understand → Prioritise → Plan → Save offline.** Pick a location, review the evidence and 'Why this location?', inspect cyclone context, view possible actions, download the offline pack, then refresh in offline mode.

## Data overview

| Layer | Interpretation |
|---|---|
| NT mobile source | 188 site/location records; infrastructure classes **not measured reception quality** |
| Mobile Black Spot projects | 48 listed project records; proximity does **not** establish coverage |
| ABS remoteness and recorded population | Regional context, with missing population kept unknown |
| NBN 2024 | **Fixed-line footprint only**; outside the polygon does not mean no broadband, satellite or fixed wireless |
| BOM historic cyclone tracks | Relative historical track proximity plus optional calculated 45-season occurrence frequency; **neither is a forecast of future cyclone risk** |
| Essential services pilot | 97 *category listings* across 63 matched locations; locality-level only, with nonmatches recorded as unknown |

The Gap Index is an illustrative, user-weighted combination of six factors. The default weight distribution is **30% mobile infrastructure, 15% NBN fixed-line context, 15% remoteness, 10% Black Spot intervention distance, 10% population impact, 20% cyclone-track exposure context**. Missing components are excluded and weights are re-normalised. See [Methodology](docs/METHODOLOGY.md).

The app does not make engineering recommendations, predict cyclone impacts, measure signal strength or determine final investment priorities. All suggested actions require technical validation, community participation and consultation with Traditional Owners.

## Repository layout

```text
remote-connectivity/
├── app/                     # Final static offline-first web app
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── data.js
│   ├── service_data.js
│   ├── cyclone_frequency_import.js  # Browser-side BOM CSV processor
│   ├── cyclone_frequency_data.js    # Replace placeholder with your real derived export
│   ├── service-worker.js
│   ├── manifest.json
│   ├── data/
│   └── assets/
├── data/                    # Original/project input and processed data (existing repo)
├── notebook/                # Data cleaning and analysis notebooks (your folder)
├── requirements-analysis.txt  # Optional dependencies for notebook reruns
├── docs/
│   ├── REPRODUCIBILITY.md
│   ├── METHODOLOGY.md
│   ├── CYCLONE_SEASONAL_METHOD.md
│   ├── DATA_AND_ETHICS.md
│   ├── DEMO.md
│   └── LAUNCH_CHECKLIST.md
└── README.md
```

## Emergency reference

Bundled official telephone reference checked **29 September 2026**: life-threatening emergency **000**, NT Emergency Service (storm/flood/cyclone assistance) **132 500**, non-urgent police **131 444**, Healthdirect **1800 022 222**. Verify current details before use; these are not live alerts, confirmed shelter availability or a calling service.

## Primary source organisations

- NT Government — Remote Areas Mobile Coverage and remote-health/local-service directories
- Australian Government — Mobile Black Spot programme records
- Australian Bureau of Statistics — ASGS remoteness and available population context
- NBN Co — supplied 2024 fixed-line footprint
- Bureau of Meteorology — historical tropical cyclone track database
- SecureNT — published emergency shelter directory

See [the cyclone calculation](docs/CYCLONE_SEASONAL_METHOD.md), [data sources, limitations and ethics](docs/DATA_AND_ETHICS.md), [reproducibility notes](docs/REPRODUCIBILITY.md), and the in-app methodology for detail. The `.gitignore` intentionally omits large source GIS binaries and downloaded ZIP archives while keeping app-bundled JSON.

## Status

Final candidate includes an optional seasonal-occurrence module; publish the **real derived** `app/cyclone_frequency_data.js` before demonstrating it to others. GitHub publication is not the same as public deployment; a live URL requires separately enabling hosting (for example GitHub Pages) after checking the intended repository visibility and source-data conditions.
