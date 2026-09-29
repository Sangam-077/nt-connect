# NT Connect — Final Review Candidate

**Find gaps. Plan action. Stay usable offline.**  CDU Data Innovation Challenge (Remote Connectivity).

NT Connect is an offline-first, static web application for interpreting Northern Territory mobile infrastructure, Mobile Black Spot project locations, ABS remoteness, population where recorded, the supplied 2024 NBN **fixed-line** footprint, and relative historical cyclone-track proximity. An initial community-level service directory adds published health/shelter/some school listings. All data are bundled into the app; no account, hosted database or third-party map-tile service is needed for the core dashboard.

## Run locally

Unzip and open a terminal **inside the `app` folder**:

```bash
python -m http.server 8070
# On Windows, if needed: py -m http.server 8070
```

Open `http://localhost:8070/` in Chrome/Edge. Do not double-click `index.html` via `file://` for service worker and offline tests. Use a fresh port after replacing an older app version; old service workers are scoped by origin.

## Core workflow

1. Open **Explore**. Select a location on the map, in the search suggestions, or from the priority ranking.
2. Open **Filters** (top right) to filter by site type, provider, infrastructure class, remoteness, cyclone exposure, population availability, verified-directory listing, or higher index values. Map layers toggle separately.
3. Switch the map among **Gap index**, **Cyclone context** and **Infrastructure** modes.
4. Open **Why this location?**, **Essential services**, or **About data** to see the interpretation and limitations.
5. Use **Compare** to display two locations side-by-side. **Action plan** provides preliminary options for investigation, not engineering approval.
6. Open **Emergency info** to view four verified phone references. A working telephone network is still required to make a call.
7. Use **Download HTML pack** for a self-contained readable community planning report. Also accessible via the **Offline** section.

## Offline test

1. Load the page once through `localhost` while online. Verify the top status changes to `Online · offline app cached` (a service-worker controller may require one reload).
2. Use Chrome/Edge DevTools → Network → Offline, then refresh. Core data, map, filters and search should remain available.
3. Open a downloaded `<community>_nt_connect_offline.html` file with the network disabled. It does not require internet or any JavaScript.
4. Emergency contacts and saved sources are **reference data**, not live alerts, open-shelter status, telephony or an emergency-response service.

## Data, score and limitations

- **188** mobile-source NT locations; **48** Mobile Black Spot project records; **97** type listings across a limited conservative locality directory (some categories may refer to the same facility).
- The Gap Index is an exploratory weighted average of mobile infrastructure class, NBN fixed-line context, remoteness, distance to a Mobile Black Spot project, population impact where recorded, and relative historical cyclone-track context. The default weights are 30/15/15/10/10/20. Users can modify them via **About data → Adjust weights**; missing components are excluded and weights re-normalised.
- Infrastructure indicators are **not field measurements** of mobile reception or reliability. The proximity-to-cell indicator does not prove reception quality. Provider labels are not market share.
- An NT mobile point outside the supplied **2024 NBN fixed-line** polygon may still have satellite or fixed wireless service. Do not call this absence of all broadband.
- Relative cyclone-context percentiles are descriptive of historical cyclone tracks and this 188-location dataset, not future hazard probability, flood/storm-surge modelling, emergency warnings, or a scientifically validated absolute risk score.
- The service pilot uses published **community-level** directory matches; it does not establish precise facility coordinates, operating status or comprehensive school coverage. An unmatched location is **unknown**, not confirmed to have no services.
- The data completeness indicator is not a reliability/confidence interval. It counts the availability of nine source-field groups.
- This tool supports discussion and triage; actual investment requires technical tests, community input, consultation with Traditional Owners and responsible Indigenous Data Sovereignty practice.

## Emergency numbers (official NT Government reference, checked 29 Sep 2026)

| Use | Telephone |
|---|---|
| Emergency (life-threatening) | 000 |
| NT Emergency Service: storm/flood/cyclone assistance | 132 500 |
| Non-urgent police assistance | 131 444 |
| Healthdirect 24/7 medical advice | 1800 022 222 |

Sources: https://nt.gov.au/emergency/emergencies/contact-an-emergency-service and https://nt.gov.au/emergency/emergencies/crisis-and-support-helplines . Calls require working service, and this directory is not live.

## App structure

- `index.html` — accessible interface and focused navigation
- `style.css` — clean responsive visual design
- `data.js` — locally embedded mobile, Black Spot and NT boundary data
- `service_data.js` — locally embedded conservative service listings
- `app.js` — search, map, profile, score, filters, comparison, action plan, and downloadable packs
- `service-worker.js`, `manifest.json`, `assets/icon*` — offline app shell and install metadata
- `assets/nt_terrain.jpg` — stylised *offline geographic context*, not a live satellite or measured coverage raster
- `data/*` — separately inspectable source-derived outputs

Only ship after running the accompanying `LAUNCH_CHECKLIST.md` on your target Windows browser and collecting screenshots for the demo.


## Optional: historical cyclone-season occurrence (new)

The new **Historical frequency** map mode and selected-location profile distinguish
45-season retrospective **cyclone-system centre track proximity** from the existing
relative historical cyclone-context score. The new percentage is **NOT a next-season
forecast, a local wind/damage probability or a measured cyclone-risk percentage**.

The existing mobile JSON contains total track counts, but **not a season-by-season
breakdown**, so we do not invent an occurrence percentage. To calculate:

1. Run `python -m http.server 8080` inside `app/` and open `http://localhost:8080`.
2. Select a location, then under **Historical cyclone-season occurrence**, click
   **Import BOM CSV & calculate**.
3. Select your official raw BOM `IDCKMSTM0S.csv` or `bom_tropical_cyclone_tracks.csv`.
   It is processed **locally in your browser**; the raw file is never uploaded.
4. The app computes the same seasonal denominator and counts for all 188 locations,
   then saves the result locally for offline access. The map mode, selected profile,
   comparison, ranking export and HTML offline packs will include the new indicator.
5. For **GitHub, other browsers or Code Fair judges**, choose **Export shareable
   cyclone_frequency_data.js** in that same dialog, copy the downloaded file
   over the placeholder at `app/cyclone_frequency_data.js`, then commit it. This
   makes the derived history bundled and offline-accessible for everyone.
6. Test a fresh/incognito browser with the bundled file to confirm that percentages
   appear without re-importing the original BOM CSV.

**Period and calculation:** 1980–81 through 2024–25, 45 complete July–June
seasons. For each location, count distinct seasons having one or more BOM
`TYPE=T` cyclone-system centre tracks within 100 km; divide by 45 and multiply
by 100. Distances are approximated locally; consecutive observation fixes are
interpolated only for intervals up to 24 hours. The panel also shows the
number of seasons within 50 and 200 km. Source: [Bureau of Meteorology best
track database](https://www.bom.gov.au/cyclone/history/). Historical records
are subject to observational limitations and do not guarantee future outcomes.
The existing Gap Index remains **unchanged**; it continues to use the relative
cyclone-context dimension, not the seasonal occurrence percentage.
